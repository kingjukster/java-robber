const { getConnection } = require("../../db/database");

async function getDynamicRobberGoal() {
  const connection = await getConnection();
  if (!connection) return 340; // fallback default

  try {
    // Collect statistics from the most recent 30 games
    const jewelResult = await connection.execute(`
      SELECT
        AVG(total_jewel_value) AS avg_val,
        STDDEV(total_jewel_value) AS std_dev,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_jewel_value) AS median_val,
        COUNT(*) AS cnt
      FROM (
        SELECT total_jewel_value
        FROM GameStats
        ORDER BY game_id DESC
        FETCH FIRST 30 ROWS ONLY
      )
    `);
    const averageValue = jewelResult.rows[0][0];
    const stdDev = jewelResult.rows[0][1];
    const medianValue = jewelResult.rows[0][2];
    const count = jewelResult.rows[0][3];

    // Calculate robber win rate over the same set of recent games
    const winRateResult = await connection.execute(`
      SELECT AVG(CASE WHEN winner = 'Robbers' THEN 1 ELSE 0 END) AS win_rate
      FROM (
        SELECT winner
        FROM GameStats
        ORDER BY game_id DESC
        FETCH FIRST 30 ROWS ONLY
      )
    `);
    const winRate = winRateResult.rows[0][0];

    if (count === 0 || averageValue === null || medianValue === null || winRate === null) {
      return 340;
    }

    // Weighted combination of median and average for stability
    let goal = medianValue * 0.7 + averageValue * 0.3;

    // Lower the goal slightly if variance is high
    goal -= (stdDev || 0) * 0.1;

    // Adjust based on win rate (ideal is 50%, shift goal ±50)
    goal += (winRate - 0.5) * 100;

    // Clamp range between 250 and 375
    return Math.min(Math.max(Math.round(goal), 250), 999);
  } catch (err) {
    console.error("Failed to calculate dynamic goal:", err);
    return 340;
  } finally {
    await connection.close();
  }
}

module.exports = { getDynamicRobberGoal };
