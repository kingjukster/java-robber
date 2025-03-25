const { getConnection } = require("../../db/database");

async function addGame({ turnCount, robberGoal, totalJewelValue, winner }) {
  const connection = await getConnection();
  if (!connection) return;

  try {
    const sql = `INSERT INTO GameStats (total_turns, robber_goal, total_jewel_value, winner) VALUES (:total_turns, :robber_goal, :total_jewel_value, :winner)`;
    const binds = {
      total_turns: { val: turnCount },
      robber_goal: { val: robberGoal },
      total_jewel_value: { val: totalJewelValue },
      winner: { val: winner },
    };
    await connection.execute(sql, binds, { autoCommit: true });
  } catch (err) {
    console.error("Error inserting game:", err);
  } finally {
    if (connection) await connection.close();
  }
}

async function addPlayer({ role, lootWorth = 0, robbersCaught = 0 }) {
  const connection = await getConnection();
  if (!connection) return;

  try {
    if (role === "Robber") {
      const sql = `
        INSERT INTO RobberStats (game_id, jewels_stolen)
        VALUES ((SELECT MAX(game_id) FROM GameStats), :jewels)
      `;
      await connection.execute(
        sql,
        { jewels: { val: lootWorth } },
        { autoCommit: true }
      );
    } else if (role === "Police") {
      const sql = `
        INSERT INTO PoliceStats (game_id, jewels_recovered, arrests_made)
        VALUES ((SELECT MAX(game_id) FROM GameStats), :jewels, :arrests)
      `;
      await connection.execute(
        sql,
        { 
          arrests: { val: robbersCaught },
          jewels: { val: lootWorth}
        },
        { autoCommit: true }
      );
    }
  } catch (err) {
    console.error("Error adding player:", err);
  } finally {
    await connection.close();
  }
}

async function getStats() {
  const connection = await getConnection();
  if (!connection) return;

  try {
    const gameResult = await connection.execute(
      `SELECT * FROM GameStats ORDER BY game_id DESC`
    );
    const robbersResult = await connection.execute(
      `SELECT * FROM RobberStats ORDER BY game_id DESC`
    );
    const policeResult = await connection.execute(
      `SELECT * FROM PoliceStats ORDER BY game_id DESC`
    );

    return {
      games: gameResult.rows,
      robbers: robbersResult.rows,
      police: policeResult.rows,
    };
  } catch (err) {
    console.error("Error querying stats:", err);
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}

async function getAllTimeStats() {
  const connection = await getConnection();
  if (!connection) return null;

  try {
    const result = await connection.execute(`
      SELECT 
        COUNT(*) AS total_games,
        SUM(CASE WHEN winner = 'Robbers' THEN 1 ELSE 0 END) AS robber_wins,
        SUM(CASE WHEN winner = 'Police' THEN 1 ELSE 0 END) AS police_wins,
        ROUND(AVG(total_turns), 2) AS avg_turns
      FROM GameStats
    `);

    const resultRobbers = await connection.execute(`
      SELECT 
        SUM(jewels_stolen) AS total,
        ROUND(AVG(jewels_stolen), 2) AS average
      FROM RobberStats
    `);

    const resultPolice = await connection.execute(`
      SELECT 
        SUM(arrests_made) AS total,
        ROUND(AVG(arrests_made), 2) AS average
      FROM PoliceStats
    `);

    const row = result.rows[0];
    const row2 = resultRobbers.rows[0];
    const row3 = resultPolice.rows[0];

    return {
      totalGames: row[0],
      robberWins: row[1],
      policeWins: row[2],
      avgTurns: row[3],
      robberTotalJewelsStolen: row2[0],
      avgJewelsStolen: row2[1],
      totalArrests: row3[0],
      avgArrests: row3[1],
    };
  } catch (err) {
    console.error("Error getting all-time stats:", err);
    return null;
  } finally {
    await connection.close();
  }
}

async function getTopRobbers() {
  const connection = await getConnection();
  if (!connection) return [];

  try {
    const result = await connection.execute(`
      SELECT robber_id, jewels_stolen
      FROM RobberStats
      ORDER BY jewels_stolen DESC
      FETCH FIRST 10 ROWS ONLY
    `);
    return result.rows;
  } catch (err) {
    console.error("Error fetching top robbers:", err);
    return [];
  } finally {
    await connection.close();
  }
}

async function getTopPolice() {
  const connection = await getConnection();
  if (!connection) return [];

  try {
    const result = await connection.execute(`
      SELECT police_id, jewels_recovered, arrests_made
      FROM PoliceStats
      ORDER BY arrests_made DESC
      FETCH FIRST 10 ROWS ONLY
    `);
    return result.rows;
  } catch (err) {
    console.error("Error fetching top police:", err);
    return [];
  } finally {
    await connection.close();
  }
}

module.exports = {
  addGame,
  addPlayer,
  getStats,
  getAllTimeStats,
  getTopRobbers,
  getTopPolice,
};
