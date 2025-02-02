const express = require('express');
const { Game } = require('./game');
//const { City } = require('./city');
const { Jewel } = require('./jewel');
const { Robber } = require('./robber');
const { Police } = require('./police');
const app = express();
const port = 3000;

app.use(express.static('public'));

let game;

app.get('/start-game', (req, res) => {
  game = new Game(); // Initialize the game
  game.populateGrid(); // Populate the grid when the game starts
  res.send({ message: 'Game Started!' });
});

app.get('/next-turn', (req, res) => {
  if (!game) {
    return res.status(400).json({ message: 'Game has not started yet.' });
  }

  // Play one turn
  game.playTurn();

  // Check if the game is over
  if (game.isGameOver()) {
    return res.json({
      message: 'Game Over',
      winner: game.isGameOver() === 'robbers' ? 'Robbers win!' : 'Police win!',
      grid: game.city.cityGrid.map(row => row.map(cell => {
        if (cell instanceof Jewel) return "J";
        if (cell instanceof Robber) return "R";
        if (cell instanceof Police) return "P";
        return ".";
      }).join(" ")).join("\n")
    });
  }

  // Return the updated grid if the game is not over
  res.json({
    grid: game.city.cityGrid.map(row => row.map(cell => {
      if (cell instanceof Jewel) return "J";
      if (cell instanceof Robber) return "R";
      if (cell instanceof Police) return "P";
      return ".";
    }).join(" ")).join("\n")
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
