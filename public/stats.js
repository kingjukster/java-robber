async function fetchAllTimeStats() {
  try {
    const response = await fetch("/all-time-stats");
    const stats = await response.json();

    // 1) Build the summary cards
    const cardsContainer = document.getElementById("stats-cards");
    cardsContainer.innerHTML = `
        <div class="stat-card">
          <h2>${stats.totalGames}</h2>
          <p>Total Games</p>
        </div>
        <div class="stat-card">
          <h2>${stats.robberWins}</h2>
          <p>Robber Wins</p>
        </div>
        <div class="stat-card">
          <h2>${stats.policeWins}</h2>
          <p>Police Wins</p>
        </div>
        <div class="stat-card">
          <h2>${stats.avgTurns}</h2>
          <p>Average Turns</p>
        </div>
      `;

    // 2) Fill Robber Stats Table
    const robberTableBody = document.querySelector("#robber-stats-table tbody");
    robberTableBody.innerHTML = ""; // Clear old rows
    const robberRow = document.createElement("tr");
    robberRow.innerHTML = `
      <td>${stats.robberWins}</td>
      <td>${stats.robberTotalJewelsStolen}</td>
      <td>${stats.avgJewelsStolen}</td>
    `;
    robberTableBody.appendChild(robberRow);

    // 3) Fill Police Stats Table
    const policeTableBody = document.querySelector("#police-stats-table tbody");
    policeTableBody.innerHTML = "";
    const policeRow = document.createElement("tr");
    policeRow.innerHTML = `
      <td>${stats.policeWins}</td>
      <td>${stats.totalArrests}</td>
      <td>${stats.avgArrests}</td>
    `;
    policeTableBody.appendChild(policeRow);

    // 4) Populate the Top 10 Robbers table
    const topRobbersTableBody = document.querySelector(
      "#top-robbers-table tbody",
    );
    topRobbersTableBody.innerHTML = "";
    // stats.topRobbers might be an array of arrays like [ [player_id, jewels_stolen, arrests_made], ... ]
    stats.topRobbers.forEach((row) => {
      const [playerId, jewelsStolen, arrestsMade] = row;
      const tr = document.createElement("tr");
      tr.innerHTML = `
         <td>${playerId}</td>
         <td>${jewelsStolen}</td>
         <td>${arrestsMade}</td>
       `;
      topRobbersTableBody.appendChild(tr);
    });

    // 5) Populate the Top 10 Police table
    const topPoliceTableBody = document.querySelector(
      "#top-police-table tbody",
    );
    topPoliceTableBody.innerHTML = "";
    stats.topPolice.forEach((row) => {
      const [playerId, jewelsStolen, arrestsMade] = row;
      const tr = document.createElement("tr");
      tr.innerHTML = `
         <td>${playerId}</td>
         <td>${jewelsStolen}</td>
         <td>${arrestsMade}</td>
       `;
      topPoliceTableBody.appendChild(tr);
    });
  } catch (error) {
    console.error("Error fetching all-time stats:", error);
  }
}

// Fetch stats on page load
window.onload = fetchAllTimeStats;
