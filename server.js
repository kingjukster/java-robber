const express = require('express');
const { Game } = require('./game');
const { Jewel } = require('./jewel');
const { Robber } = require('./robber');
const { Police } = require('./police');
const { addGame, addPlayer, getAllTimeStats, getTopRobbers, getTopPolice } = require('./gameService');
// If you need 'logTurn' or 'getStats', import them too
// const { logTurn, getStats } = require('./gameService');

const app = express();
const port = 3000;

// Serve static files from 'public' or your chosen directory
app.use(express.static('public'));

let game;

// Start Game
app.get('/start-game', (req, res) => {
  game = new Game();
  game.populateGrid(); // Initialize the grid

  // Convert the city grid to a simple array of characters for the client
  const cityGrid = game.city.cityGrid.map(row => 
    row.map(cell => {
      if (cell instanceof Jewel) return "J";
      if (cell instanceof Robber) return "R";
      if (cell instanceof Police) return "P";
      return ".";
    })
  );

  res.json({ cityGrid });
});

// Next Turn
app.get('/next-turn', async (req, res) => {
  // SAFETY CHECK: If there's no game yet, return an error
  if (!game) {
    return res.status(400).json({
      error: "No game in progress. Please start a new game first."
    });
  }

  // Advance the game by one turn
  game.playTurn();
  const gameOverMessage = game.isGameOver();

  // If the game ended this turn...
  if (gameOverMessage) {
    try {
      // Save final stats to DB
      await addGame({
        turnCount: game.turns,
        winner: gameOverMessage === "Robbers Win!" ? "Robber" : "Police"
      });

      // Save each Robber/Police to DB
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          const cell = game.city.cityGrid[x][y];
          if (cell instanceof Robber) {
            await addPlayer({
              role: 'Robber',
              lootWorth: cell.totalLootWorth
            });
          } else if (cell instanceof Police) {
            await addPlayer({
              role: 'Police',
              lootWorth: cell.lootWorth,
              robbersCaught: cell.robbersCaught
            });
          }
        }
      }
    } catch (err) {
      console.error("Error saving game stats:", err);
      return res.status(500).json({ error: "Failed to save game stats." });
    }

    // Return the game-over message, no grid needed
    return res.json({
      message: gameOverMessage,
      cityGrid: null
    });
  }

  // Otherwise, send the updated grid
  const cityGrid = game.city.cityGrid.map(row => 
    row.map(cell => {
      if (cell instanceof Jewel) return "J";
      if (cell instanceof Robber) return "R";
      if (cell instanceof Police) return "P";
      return ".";
    })
  );

  res.json({ cityGrid });
});

// New Game
app.get('/new-game', (req, res) => {
  game = new Game();
  game.populateGrid();

  const cityGrid = game.city.cityGrid.map(row => 
    row.map(cell => {
      if (cell instanceof Jewel) return "J";
      if (cell instanceof Robber) return "R";
      if (cell instanceof Police) return "P";
      return ".";
    })
  );
  res.json({ cityGrid });
});

// Current Stats
app.get('/current-stats', (req, res) => {
  // If no game or game is over, return active = false
  if (!game) {
    return res.json({ active: false });
  }

  // Summarize robber data
  const totalRobberLoot = game.robbers.reduce((sum, r) => sum + r.totalLootWorth, 0);
  const robberGoal = game.robberGoal || 200;

  const gameOverMessage = game.isGameOver(); // e.g. "Robbers Win!" or "Police Win!" or false
  let winner;
  if (gameOverMessage === "Robbers Win!") {
    winner = "Robbers";
  } else if (gameOverMessage === "Police Win!") {
    winner = "Police";
  } else {
    winner = "In Progress";
  }

  const robberStats = game.robbers.map(r => ({
    robberId: r.robberId,
    totalLoot: r.totalLootWorth,
    isActive: r.isActive
  }));

  const policeStats = game.police.map(p => ({
    policeId: p.policeId,
    lootWorth: p.lootWorth,
    robbersCaught: p.robbersCaught
  }));

  res.json({
    active: true,
    turns: game.turns,
    jewelsRemaining: game.city.jewelCount,
    totalRobberLoot,
    robberGoal,
    winner,
    robbers: robberStats,
    police: policeStats
  });
});



app.get('/all-time-stats', async (req, res) => {
  try {
    const stats = await getAllTimeStats();
    const topRobbers = await getTopRobbers();
    const topPolice = await getTopPolice();

    if (!stats) {
      return res.status(500).json({ error: "Could not retrieve stats." });
    }

    // Return aggregated stats plus top 10 lists
    res.json({
      ...stats,
      topRobbers, // array of rows
      topPolice
    });
  } catch (err) {
    console.error("Error retrieving all-time stats:", err);
    res.status(500).json({ error: "Failed to fetch stats." });
  }
});

app.get('/simulate-multiple', async (req, res) => {
  // Number of games to simulate, default to 1 if not specified
  const numGames = parseInt(req.query.numGames, 10) || 1;
  console.log(`Simulating ${numGames} games...`);

  try {
    for (let i = 0; i < numGames; i++) {
      // 1) Create a new Game
      const simGame = new Game();
      simGame.populateGrid();
      
      // 2) Play until it ends
      while (!simGame.isGameOver()) {
        simGame.playTurn();
      }
      
      // 3) Get the final gameOverMessage and store stats in DB
      const gameOverMessage = simGame.isGameOver();
      const winner = (gameOverMessage === "Robbers Win!") ? "Robbers" : "Police";
      
      // Insert game record
      await addGame({ turnCount: simGame.turns, winner });
      
      // Insert each robber/police
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          const cell = simGame.city.cityGrid[x][y];
          if (cell instanceof Robber) {
            await addPlayer({ role: 'Robber', lootWorth: cell.totalLootWorth });
          } else if (cell instanceof Police) {
            await addPlayer({ role: 'Police', lootWorth: cell.lootWorth, robbersCaught: cell.robbersCaught });
          }
        }
      }
    }

    return res.json({ message: `Successfully simulated ${numGames} games.` });
  } catch (err) {
    console.error("Error simulating multiple games:", err);
    return res.status(500).json({ error: "Failed to simulate multiple games." });
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
