const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'mockStats.json');

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read mock DB:', err);
  }
  return { GameStats: [], RobberStats: [], PoliceStats: [] };
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to write mock DB:', err);
  }
}

function addGame({ turnCount, robberGoal, totalJewelValue, winner }) {
  const data = loadData();
  const gameId = data.GameStats.length + 1;
  data.GameStats.push({
    game_id: gameId,
    total_turns: turnCount,
    robber_goal: robberGoal,
    total_jewel_value: totalJewelValue,
    winner,
  });
  saveData(data);
  return gameId;
}

function addRobber({ gameId, jewels_stolen }) {
  const data = loadData();
  data.RobberStats.push({ game_id: gameId, jewels_stolen });
  saveData(data);
}

function addPolice({ gameId, jewels_recovered, arrests_made }) {
  const data = loadData();
  data.PoliceStats.push({ game_id: gameId, jewels_recovered, arrests_made });
  saveData(data);
}

function computeStats() {
  const data = loadData();
  return data;
}

module.exports = {
  addGame,
  addRobber,
  addPolice,
  computeStats,
};
