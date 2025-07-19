const express = require("express");
const router = express.Router();
const { getConnection } = require("../../db/database");

router.get("/stats", async (req, res) => {
  const connection = await getConnection();
  if (!connection) {
    return res.status(500).json({ error: "Database connection failed" });
  }
  try {
    // 1. Total games, wins
    const totalGamesQuery = await connection.execute(`SELECT COUNT(*) FROM GameStats`);
    const totalGames = totalGamesQuery.rows[0][0];

    const robberWinsQuery = await connection.execute(`
      SELECT COUNT(*) FROM GameStats WHERE winner = 'Robbers'
    `);
    const robberWins = robberWinsQuery.rows[0][0];

    const winRate = totalGames > 0 ? robberWins / totalGames : 0;

    // 2. Win rate by goal
    const winRateQuery = await connection.execute(`
      SELECT robber_goal,
             COUNT(*) AS games,
             SUM(CASE WHEN winner = 'Robbers' THEN 1 ELSE 0 END) AS robber_wins
      FROM GameStats
      GROUP BY robber_goal
      ORDER BY robber_goal
    `);

    const winRateGoals = winRateQuery.rows.map(row => row[0]);
    const winRates = winRateQuery.rows.map(row => row[2] / row[1]);

    // 3. Jewel value distribution
    const jewelQuery = await connection.execute(`SELECT total_jewel_value FROM GameStats`);
    const jewelValues = jewelQuery.rows.map(row => row[0]);

    const jewelBins = [
      "300-320", "320-340", "340-360", "360-380", "380-400",
      "400-420", "420-440", "440-460", "460-480", "480-500",
      "500-520", "520-540", "540-560", "560-580", "580-600",
      "600-620", "620-640", "640-660", "660-680", "680-700+"
    ];
    const jewelCounts = new Array(jewelBins.length).fill(0);

    jewelValues.forEach(val => {
      if (val >= 300) {
        const binIndex = Math.min(Math.floor((val - 300) / 20), jewelBins.length - 1);
        jewelCounts[binIndex]++;
      }
    });


    // 4. Close calls (robbers with loot >= 300)
    const closeCallQuery = await connection.execute(`
      SELECT game_id, SUM(CASE WHEN jewels_stolen >= 300 THEN 1 ELSE 0 END) AS close_count
      FROM RobberStats
      GROUP BY game_id
    `);

    const closeCallBins = [0, 0, 0, 0, 0];
    closeCallQuery.rows.forEach(row => {
      const count = row[1];
      if (count >= 0 && count <= 4) closeCallBins[count]++;
    });

    // 5. Arrest count distribution per game
    const arrestQuery = await connection.execute(`
      SELECT game_id, SUM(arrests_made) AS total_arrests
      FROM PoliceStats
      GROUP BY game_id
    `);
    const arrestDist = [0, 0, 0, 0, 0];
    arrestQuery.rows.forEach(row => {
      const a = row[1];
      const idx = a >= 4 ? 4 : a;
      arrestDist[idx]++;
    });

    // 6. Average performance metrics per game
    const avgLootQuery = await connection.execute(`
      SELECT AVG(total_loot) FROM (
        SELECT game_id, SUM(jewels_stolen) AS total_loot
        FROM RobberStats
        GROUP BY game_id
      )
    `);
    const avgRecoveredQuery = await connection.execute(`
      SELECT AVG(total_recovered) FROM (
        SELECT game_id, SUM(jewels_recovered) AS total_recovered
        FROM PoliceStats
        GROUP BY game_id
      )
    `);
    const avgArrestsQuery = await connection.execute(`
      SELECT AVG(total_arrests) FROM (
        SELECT game_id, SUM(arrests_made) AS total_arrests
        FROM PoliceStats
        GROUP BY game_id
      )
    `);

    const performance = {
      avgLootStolen: avgLootQuery.rows[0][0] || 0,
      avgLootRecovered: avgRecoveredQuery.rows[0][0] || 0,
      avgArrests: avgArrestsQuery.rows[0][0] || 0,
    };

    res.json({
      winRateGoals,
      winRates,
      jewelBins,
      jewelCounts,
      closeCalls: closeCallBins,
      arrestDist,
      performance,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
