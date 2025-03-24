const { getConnection } = require("../../db/database");

async function getDynamicRobberGoal() {
  const connection = await getConnection();
  if (!connection) return 340; // fallback default

  try {
    const result = await connection.execute(`
      SELECT AVG(total_jewel_value)
      FROM GameStats
    `);
    const averageValue = result.rows[0][0];

    if (!averageValue) return 340;

    // Adjust the goal based on average — use 75% as a baseline
    const goal = Math.round(averageValue * 0.75);

    // Clamp between 250–375 (or whatever bounds make sense)
    return Math.min(Math.max(goal, 250), 375);
  } catch (err) {
    console.error("Failed to calculate dynamic goal:", err);
    return 340;
  } finally {
    await connection.close();
  }
}

module.exports = { getDynamicRobberGoal };
