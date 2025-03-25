const { getConnection } = require("../../db/database");

async function getDynamicRobberGoal() {
  const connection = await getConnection();
  if (!connection) return 340; // fallback default

  try {
    // Get average jewel value
    const jewelResult = await connection.execute(`
      SELECT AVG(total_jewel_value) FROM GameStats
    `);
    const averageValue = jewelResult.rows[0][0];

    // Get robber win rate
    const winRateResult = await connection.execute(`
      SELECT AVG(CASE WHEN winner = 'Robbers' THEN 1 ELSE 0 END) AS win_rate
      FROM GameStats
    `);
    const winRate = winRateResult.rows[0][0];

    if (!averageValue || winRate === null) return 340;

    // Base goal from 85% of jewel value
    let goal = averageValue * 0.85;

    // Adjust based on win rate (ideal is 50%, shift goal ±20)
    goal += (winRate - 0.5) * 100;

    // Clamp range between 250 and 375
    return Math.min(Math.max(Math.round(goal), 250), 375);
  } catch (err) {
    console.error("Failed to calculate dynamic goal:", err);
    return 340;
  } finally {
    await connection.close();
  }
}

module.exports = { getDynamicRobberGoal };
