/* exported startGame, nextTurn, newGame, simulateGame, simulateMultipleGames */

async function startGame() {
  // Hide title screen, show game container
  document.getElementById("title-screen").style.display = "none";
  document.getElementById("game-container").style.display = "flex";

  try {
    const response = await fetch("/start-game");
    const data = await response.json();
    if (data.cityGrid) {
      populateGrid(data.cityGrid);
    }
    // Fetch initial stats
    fetchCurrentStats();
  } catch (error) {
    console.error("Error starting game:", error);
  }
}

async function nextTurn() {
  const response = await fetch("/next-turn");
  const data = await response.json();

  // If game ended
  if (data.message) {
    alert(data.message);
    document.getElementById("next-turn-btn").disabled = true;
    // Fetch final stats even though the game is over
    fetchCurrentStats();
    return;
  }

  // Otherwise, game continues
  if (data.cityGrid) {
    populateGrid(data.cityGrid);
  }
  fetchCurrentStats();
}

async function newGame() {
  // Re-enable next-turn button
  document.getElementById("next-turn-btn").disabled = false;
  document.getElementById("simulate-btn").disabled = false;
  // Hide title screen if it’s visible
  document.getElementById("title-screen").style.display = "none";
  // Show the game container
  document.getElementById("game-container").style.display = "flex";

  try {
    const response = await fetch("/new-game");
    const data = await response.json();
    if (data.cityGrid) {
      populateGrid(data.cityGrid);
    }
    fetchCurrentStats();
  } catch (error) {
    console.error("Error starting new game:", error);
  }
}

function populateGrid(cityGrid) {
  const grid = document.getElementById("grid");
  grid.innerHTML = ""; // Clear previous cells

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const cellDiv = document.createElement("div");
      cellDiv.classList.add("cell");

      const cell = cityGrid[row][col];
      if (cell === "J") {
        cellDiv.textContent = "J";
        cellDiv.style.backgroundColor = "#FFD700"; // bright gold
      } else if (cell === "R") {
        cellDiv.textContent = "R";
        cellDiv.style.backgroundColor = "#f44336"; // red
      } else if (cell === "P") {
        cellDiv.textContent = "P";
        cellDiv.style.backgroundColor = "#2196f3"; // blue
      } else {
        cellDiv.textContent = ".";
        cellDiv.style.backgroundColor = "#666";
      }

      grid.appendChild(cellDiv);
    }
  }
}

async function fetchCurrentStats() {
  try {
    const response = await fetch("/current-stats");
    const stats = await response.json();

    // If no active game, reset stats
    if (!stats.active) {
      document.getElementById("stat-turn").textContent = "N/A";
      document.getElementById("stat-winner").textContent = "None";
      document.getElementById("stat-robber-loot").textContent = "0";
      document.getElementById("stat-robber-goal").textContent = "0";
      document.getElementById("loot-progress").style.width = "0";

      // Clear the player lists
      document.getElementById("robber-list").innerHTML = "";
      document.getElementById("police-list").innerHTML = "";
      return;
    }

    // Update main stats
    document.getElementById("stat-turn").textContent = stats.turns;
    document.getElementById("stat-winner").textContent = stats.winner;
    document.getElementById("stat-robber-loot").textContent =
      stats.totalRobberLoot;
    document.getElementById("stat-robber-goal").textContent = stats.robberGoal;

    // Update progress bar
    const progressPercent = Math.min(
      (stats.totalRobberLoot / stats.robberGoal) * 100,
      100,
    );
    document.getElementById("loot-progress").style.width =
      `${progressPercent}%`;

    // Display player stats
    displayPlayerStats(stats);
  } catch (error) {
    console.error("Error fetching current stats:", error);
  }
}

/**
 * Renders the robber and police arrays into lists in the second panel.
 */
function displayPlayerStats(stats) {
  const robberList = document.getElementById("robber-list");
  const policeList = document.getElementById("police-list");

  // Clear old entries
  robberList.innerHTML = "";
  policeList.innerHTML = "";

  // stats.robbers is an array of objects like { robberId, totalLoot, isActive }
  stats.robbers.forEach((r) => {
    const li = document.createElement("li");
    li.textContent = `Robber ${r.robberId} - Loot: ${r.totalLoot} - Active: ${r.isActive}`;
    robberList.appendChild(li);
  });

  // stats.police is an array of objects like { policeId, lootWorth, robbersCaught }
  stats.police.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = `Police ${p.policeId} - Loot: ${p.lootWorth} - Robbers Caught: ${p.robbersCaught}`;
    policeList.appendChild(li);
  });
}

async function simulateGame() {
  // Disable the Simulate button so we don’t double-click
  document.getElementById("simulate-btn").disabled = true;

  // We can loop until the game ends
  let gameOver = false;

  while (!gameOver) {
    try {
      // Call next-turn
      const response = await fetch("/next-turn");
      const data = await response.json();

      if (data.cityGrid) {
        populateGrid(data.cityGrid);
      }
      fetchCurrentStats();

      if (data.message) {
        // Game is over
        alert(data.message);
        document.getElementById("next-turn-btn").disabled = true;
        gameOver = true;
      } else {
        // Optional: small delay so the user sees changes
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error("Error simulating game:", error);
      break;
    }
  }
}

function simulateMultipleGames() {
  const userInput = prompt("Enter the number of games to simulate:");
  const numGames = parseInt(userInput, 10);

  if (isNaN(numGames) || numGames <= 0) {
    alert("Invalid number of games.");
    return;
  }

  // Call the server route
  fetch(`/simulate-multiple?numGames=${numGames}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert("Error: " + data.error);
      } else {
        alert(data.message);
        // Optionally, refresh stats or do something else
        // fetchCurrentStats();
      }
    })
    .catch((err) => {
      console.error("Error simulating multiple games:", err);
      alert("Failed to simulate games.");
    });
}
