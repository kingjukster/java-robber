// script.js

// Base URL for your backend API
const API_BASE_URL = 'http://localhost:8080/api';

// Function to fetch the city grid from the backend
async function fetchCityGrid() {
  try {
    const response = await fetch(`${API_BASE_URL}/city`);
    const grid = await response.json();
    renderGrid(grid);
  } catch (error) {
    console.error('Error fetching city grid:', error);
  }
}

// Function to render the city grid on the webpage
function renderGrid(grid) {
  const gridContainer = document.getElementById('grid');
  gridContainer.innerHTML = ''; // Clear the grid

  grid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellDiv = document.createElement('div');
      cellDiv.classList.add('cell');

      // Add classes based on cell content
      if (cell === 'J') cellDiv.classList.add('jewel');
      else if (cell === 'R') cellDiv.classList.add('robber');
      else if (cell === 'P') cellDiv.classList.add('police');

      gridContainer.appendChild(cellDiv);
    });
  });
}

// Function to restart the game
async function restartGame() {
  try {
    const response = await fetch(`${API_BASE_URL}/restart`, { method: 'POST' });
    const message = await response.text();
    console.log(message);
    await fetchCityGrid(); // Reload the grid after restarting
  } catch (error) {
    console.error('Error restarting the game:', error);
  }
}

// Set up event listeners and initialize the game
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('restart-btn').addEventListener('click', restartGame);
  fetchCityGrid(); // Fetch and render the grid on page load
});
