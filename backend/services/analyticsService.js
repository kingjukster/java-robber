const { getConnection } = require("../../db/database");

async function getDynamicRobberGoal() {
  const connection = await getConnection();
  if (!connection) return 340; // fallback default

  try {
    // Get average and standard deviation of jewel values from the last 30 games
    const jewelResult = await connection.execute(`
      SELECT AVG(total_jewel_value) AS avg_val,
             STDDEV(total_jewel_value) AS std_dev
      FROM (
        SELECT total_jewel_value
        FROM GameStats
        ORDER BY game_id DESC
        FETCH FIRST 30 ROWS ONLY
      )
    `);
    const averageValue = jewelResult.rows[0][0];
    const stdDev = jewelResult.rows[0][1];

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

    if (averageValue === null || winRate === null) return 340;

    // Start from the average minus a portion of the standard deviation
    let goal = averageValue - (stdDev || 0) * 0.2;

    // Adjust based on win rate (ideal is 50%, shift goal ±40)
    goal += (winRate - 0.5) * 80;

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
