const { getConnection } = require("../../db/database");
const jsonStore = require("../../db/jsonStorage");

async function addGame({ turnCount, robberGoal, totalJewelValue, winner }, conn) {
  const connection = conn || (await getConnection());
  if (!connection) {
    // Fallback to JSON storage when DB is unavailable
    return jsonStore.addGame({
      turnCount,
      robberGoal,
      totalJewelValue,
      winner,
    });
  }

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
    if (!conn && connection) await connection.close();
  }
}

async function addPlayer({ role, lootWorth = 0, robbersCaught = 0 }, conn) {
  const connection = conn || (await getConnection());
  if (!connection) {
    const gameId = jsonStore.computeStats().GameStats.length;
    if (role === "Robber") {
      jsonStore.addRobber({ gameId, jewels_stolen: lootWorth });
    } else if (role === "Police") {
      jsonStore.addPolice({
        gameId,
        jewels_recovered: lootWorth,
        arrests_made: robbersCaught,
      });
    }
    return;
  }

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
    if (!conn && connection) await connection.close();
  }
}

async function getStats() {
  const connection = await getConnection();
  if (!connection) {
    const data = jsonStore.computeStats();
    return {
      games: data.GameStats,
      robbers: data.RobberStats,
      police: data.PoliceStats,
    };
  }

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
  if (!connection) {
    const data = jsonStore.computeStats();
    const totalGames = data.GameStats.length;
    const robberWins = data.GameStats.filter(g => g.winner === 'Robbers').length;
    const policeWins = data.GameStats.filter(g => g.winner === 'Police').length;
    const avgTurns =
      totalGames === 0
        ? 0
        : data.GameStats.reduce((s, g) => s + g.total_turns, 0) / totalGames;
    const totalJewels = data.RobberStats.reduce((s, r) => s + r.jewels_stolen, 0);
    const avgJewels =
      data.RobberStats.length === 0
        ? 0
        : totalJewels / data.RobberStats.length;
    const totalArrests = data.PoliceStats.reduce(
      (s, p) => s + p.arrests_made,
      0
    );
    const avgArrests =
      data.PoliceStats.length === 0
        ? 0
        : totalArrests / data.PoliceStats.length;

    return {
      totalGames,
      robberWins,
      policeWins,
      avgTurns: Math.round(avgTurns * 100) / 100,
      robberTotalJewelsStolen: totalJewels,
      avgJewelsStolen: Math.round(avgJewels * 100) / 100,
      totalArrests,
      avgArrests: Math.round(avgArrests * 100) / 100,
    };
  }

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
  if (!connection) {
    const data = jsonStore.computeStats();
    const sorted = data.RobberStats.slice().sort((a, b) => b.jewels_stolen - a.jewels_stolen);
    return sorted.slice(0, 10).map((r, idx) => [idx + 1, r.jewels_stolen]);
  }

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
  if (!connection) {
    const data = jsonStore.computeStats();
    const sorted = data.PoliceStats.slice().sort((a, b) => b.arrests_made - a.arrests_made);
    return sorted.slice(0, 10).map((p, idx) => [idx + 1, p.jewels_recovered, p.arrests_made]);
  }

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
