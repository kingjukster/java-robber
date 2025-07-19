const express = require("express");
const { Game } = require("../models/game");
const { Jewel } = require("../models/jewel");
const { Robber } = require("../models/robber");
const { Police } = require("../models/police");
const {
  addGame,
  addPlayer,
  getAllTimeStats,
  getTopRobbers,
  getTopPolice,
} = require("../services/gameService");
const statsRoutes = require("./simstats");
const { getDynamicRobberGoal } = require("../services/analyticsService");

const app = express();
const port = 3000;

app.use("/api", statsRoutes);
app.use(express.static("public"));

let game;

app.get("/start-game", async (req, res) => {
  const dynamicGoal = await getDynamicRobberGoal();
  game = new Game();
  game.robberGoal = dynamicGoal;
  game.populateGrid();

  const cityGrid = game.city.cityGrid.map((row) =>
    row.map((cell) => {
      if (cell instanceof Jewel) return "J";
      if (cell instanceof Robber) return "R";
      if (cell instanceof Police) return "P";
      return ".";
    })
  );

  res.json({ cityGrid });
});

app.get("/next-turn", async (req, res) => {
  if (!game) {
    return res.status(400).json({
      error: "No game in progress. Please start a new game first.",
    });
  }

  game.playTurn();
  const gameOverMessage = game.isGameOver();

  if (gameOverMessage) {
    try {
      await addGame({
        turnCount: game.turns,
        robberGoal: game.robberGoal,
        totalJewelValue: game.city.totalJewelValue || 0,
        winner: gameOverMessage === "Robbers Win!" ? "Robbers" : "Police",
      });

      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          const cell = game.city.cityGrid[x][y];
          if (cell instanceof Robber) {
            await addPlayer({
              role: "Robber",
              lootWorth: cell.totalLootWorth,
            });
          } else if (cell instanceof Police) {
            await addPlayer({
              role: "Police",
              lootWorth: cell.lootWorth,
              robbersCaught: cell.robbersCaught,
              
            });
          }
        }
      }
    } catch (err) {
      console.error("Error saving game stats:", err);
      return res.status(500).json({ error: "Failed to save game stats." });
    }

    return res.json({
      message: gameOverMessage,
      cityGrid: null,
    });
  }

  const cityGrid = game.city.cityGrid.map((row) =>
    row.map((cell) => {
      if (cell instanceof Jewel) return "J";
      if (cell instanceof Robber) return "R";
      if (cell instanceof Police) return "P";
      return ".";
    })
  );

  res.json({ cityGrid });
});

app.get("/new-game", async (req, res) => {
  game = new Game();
  game.robberGoal = await getDynamicRobberGoal();
  game.populateGrid();

  const cityGrid = game.city.cityGrid.map((row) =>
    row.map((cell) => {
      if (cell instanceof Jewel) return "J";
      if (cell instanceof Robber) return "R";
      if (cell instanceof Police) return "P";
      return ".";
    })
  );
  res.json({ cityGrid });
});

app.get("/current-stats", (req, res) => {
  if (!game) {
    return res.json({ active: false });
  }

  const totalRobberLoot = game.robbers.reduce(
    (sum, r) => sum + r.totalLootWorth,
    0
  );
  const robberGoal = game.robberGoal || 200;

  const gameOverMessage = game.isGameOver();
  let winner = "In Progress";
  if (gameOverMessage === "Robbers Win!") {
    winner = "Robbers";
  } else if (gameOverMessage === "Police Win!") {
    winner = "Police";
  }

  const robberStats = game.robbers.map((r) => ({
    robberId: r.robberId,
    totalLoot: r.totalLootWorth,
    isActive: r.isActive,
  }));

  const policeStats = game.police.map((p) => ({
    policeId: p.policeId,
    lootWorth: p.lootWorth,
    robbersCaught: p.robbersCaught,
  }));

  res.json({
    active: true,
    turns: game.turns,
    jewelsRemaining: game.city.jewelCount,
    totalRobberLoot,
    robberGoal,
    winner,
    robbers: robberStats,
    police: policeStats,
  });
});

app.get("/all-time-stats", async (req, res) => {
  try {
    const stats = await getAllTimeStats();
    const topRobbers = await getTopRobbers();
    const topPolice = await getTopPolice();

    if (!stats) {
      return res.status(500).json({ error: "Could not retrieve stats." });
    }

    res.json({
      ...stats,
      topRobbers,
      topPolice,
    });
  } catch (err) {
    console.error("Error retrieving all-time stats:", err);
    res.status(500).json({ error: "Failed to fetch stats." });
  }
});

app.get("/simulate-multiple", async (req, res) => {
  const numGames = parseInt(req.query.numGames, 10) || 1;
  console.log(`Simulating ${numGames} games...`);

  try {
    for (let i = 0; i < numGames; i++) {
      const simGame = new Game()
      simGame.robberGoal = await getDynamicRobberGoal();;
      simGame.populateGrid();

      while (!simGame.isGameOver()) {
        simGame.playTurn();
      }

      const gameOverMessage = simGame.isGameOver();
      const winner = gameOverMessage === "Robbers Win!" ? "Robbers" : "Police";

      await addGame({
        turnCount: simGame.turns,
        robberGoal: simGame.robberGoal,
        totalJewelValue: simGame.city.totalJewelValue|| 0,
        winner,
      });

      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          const cell = simGame.city.cityGrid[x][y];
          if (cell instanceof Robber) {
            await addPlayer({ role: "Robber", lootWorth: cell.totalLootWorth });
          } else if (cell instanceof Police) {
            await addPlayer({role: "Police", lootWorth: cell.lootWorth, robbersCaught: cell.robbersCaught,
            });
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

app.get('/', (req, res) => {
  res.redirect('/index.html');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
