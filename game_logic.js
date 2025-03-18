// Assuming Game class is imported here
const { Game } = require('./game');  // Import Game class

// Initialize the game
const game = new Game();

// Function to start the game (initializes grid, etc.)
function startGame() {
    game.populateGrid(); // Populate the grid with jewels, robbers, and police
    game.printGrid();    // Print the initial state of the grid
}

// Trigger the playTurn method when the button is clicked
function playTurn() {
    game.playTurn();    // Execute one turn
    if (game.isGameOver()) {
        alert("Game Over!");
    }
    game.printGrid();    // Print the updated grid after the turn
}

// Start the game when the page loads
window.onload = startGame;
