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
  game = new Game();  // Reset the game
  game.populateGrid(); // Initialize the grid

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



app.get('/next-turn', (req, res) => {
  game.playTurn(); // Advance the game

  // Check if the game is over
  if (game.isGameOver()) {
      return res.json({ 
          message: game.getGameOverMessage(), // Send game-over message
          cityGrid: null  // No need to send grid since game is over
      });
  }

  // Otherwise, return the updated grid
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




app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
