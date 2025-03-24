const express = require("express");
const router = express.Router();
const { getConnection } = require("../../db/database");

router.get("/stats", async (req, res) => {
  const connection = await getConnection();
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

    const jewelBins = ["220-240", "240-260", "260-280", "280-300", "300-320", "320-340"];
    const jewelCounts = [0, 0, 0, 0, 0, 0];
    jewelValues.forEach(val => {
      if (val < 240) jewelCounts[0]++;
      else if (val < 260) jewelCounts[1]++;
      else if (val < 280) jewelCounts[2]++;
      else if (val < 300) jewelCounts[3]++;
      else if (val < 320) jewelCounts[4]++;
      else jewelCounts[5]++;
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

    res.json({
      winRateGoals,
      winRates,
      jewelBins,
      jewelCounts,
      closeCalls: closeCallBins
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
