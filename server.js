const express = require('express');
const { Game } = require('./game');
//const { City } = require('./city');
const { Jewel } = require('./jewel');
const { Robber } = require('./robber');
const { Police } = require('./police');
const { createGame, addPlayer, logTurn } = require('./gameService');
const app = express();
const port = 3000;

app.use(express.static('public'));

let game;

app.get('/start-game', (req, res) => {
  game = new Game();
  game.populateGrid(); // Initialize the grid

  const cityGrid = game.city.cityGrid.map(row => 
      row.map(cell => {
          if (cell instanceof Jewel) return "J";
          if (cell instanceof Robber) return "R";
          if (cell instanceof Police) return "P";
          return ".";
      })
  );

  res.json({ cityGrid});
});



app.get('/next-turn', async (req, res) => {
  game.playTurn(); // Advance the game

  // Get game-over status
  const gameOverMessage = game.isGameOver();

  if (gameOverMessage) {  // If gameOverMessage is not false
    try {
      const winner = gameOverMessage === "Robber wins" ? "Robber" : "Police";
      const turnCount = game.turns;
      console.log(turnCount);
      const gameRecord = await createGame({ turnCount, winner });
      const gameID = gameRecord.game_id;
      for ( let x = 0; x < 10; x++ ) {
        for ( let y = 0; y < 10; y++ ) {
          if (game.city.cityGrid[x][y] instanceof Robber) {
            await addPlayer( gameID, "Robber", game.city.cityGrid[x][y].totalLootWorth )
          }
          if (game.city.cityGrid[x][y] instanceof Police) {
            await addPlayer( gameID, "Police", game.city.cityGrid[x][y].lootWorth, game.city.cityGrid[x][y].robbersCaught )
          }
        }
      }
    } catch (err) {
      console.error("Error saving game stats:", err);
      return res.status(500).json({ error: "Failed to save game stats." });
    }
      return res.json({ 
          message: gameOverMessage, // Send the result from isGameOver()
          cityGrid: null  // No need to send the grid since game is over
      });
  }
  // Map cityGrid to a readable format
  const cityGrid = game.city.cityGrid.map(row => 
    row.map(cell => {
        if (cell instanceof Jewel) return "J";
        if (cell instanceof Robber) return "R";
        if (cell instanceof Police) return "P";
        return ".";  // Empty space
    })
);

  res.json({ cityGrid });
});


app.get('/new-game', (req, res) => {
  // Reset game by creating a new Game object and re-populating the grid
  game = new Game();  // Recreate the Game object to reset
  game.populateGrid();  // Reinitialize the grid

  const cityGrid = game.city.cityGrid.map(row => 
      row.map(cell => {
          if (cell instanceof Jewel) return "J";
          if (cell instanceof Robber) return "R";
          if (cell instanceof Police) return "P";
          return ".";  // Empty cell
      })
  );

  res.json({ cityGrid });  // Send back the fresh city grid
});



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
