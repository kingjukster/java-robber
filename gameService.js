const { query } = require("express");
const { getConnection } = require("./database");
const oracledb = require('oracledb');


async function addGame({ turnCount, winner }) {
  const connection = await getConnection();
  if (!connection) return;

  try {
    const sql = `INSERT INTO GameStats (total_turns, winner) VALUES (:total_turns, :winner)`;
    // Use plain values or wrap them in an object with a "val" property if needed.
    const binds = {
      total_turns: { val: turnCount },
      winner: { val: winner }
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
  //console.log(role, lootWorth, robbersCaught);
  try {
    const sql = `
      INSERT INTO PlayerStats (game_id, role, jewels_stolen, arrests_made) 
      VALUES ((SELECT MAX(game_id) FROM GameStats), :role, :jewels, :arrests)
    `;
    const binds = {
      role: { val: role },
      jewels: { val: lootWorth },
      arrests: { val: robbersCaught }
    };
    await connection.execute(sql, binds, { autoCommit: true });
    //console.log(`Player added with role ${role}`);
  } catch (err) {
    console.error("Error adding player:", err);
  } finally {
    await connection.close();
  }
}

//not currently used
async function logTurn(gameId, turnNum, robbers, police, jewelsLeft) {
    const connection = await getConnection();
    if (!connection) return;

    try {
        await connection.execute(
        `INSERT INTO TurnLogs (game_id, turn_number, robber_positions, police_positions, jewels_remaining)
            VALUES (:game_id, :turn_number, :robber_positions, :police_positions, :jewels_remaining)`,
        {
            game_id: gameId,
            turn_number: turnNum,
            robber_positions: JSON.stringify(robbers),
            police_positions: JSON.stringify(police),
            jewels_remaining: jewelsLeft
        },
        { autoCommit: true }
        );

        //console.log(`Turn ${turnNum} logged for game ${gameId}`);
    } catch (err) {
        console.error("Error logging turn:", err);
    } finally {
        await connection.close();
    }
    }

async function getStats() {
  const connection = await getConnection();
  if (!connection) return;

  try {
    // For example, fetching game stats and player stats
    const gameResult = await connection.execute(
      `SELECT * FROM GameStats ORDER BY game_id DESC`
    );
    const playerResult = await connection.execute(
      `SELECT * FROM PlayerStats ORDER BY game_id DESC`
    );

    return {
      games: gameResult.rows,
      players: playerResult.rows
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
    // 1) Query aggregated game stats
    // Adjust to match your GameStats table columns (e.g., total_turns, winner, etc.)
    const result = await connection.execute(`
      SELECT 
        COUNT(*) AS total_games,
        SUM(CASE WHEN winner = 'Robbers' THEN 1 ELSE 0 END) AS robber_wins,
        SUM(CASE WHEN winner = 'Police' THEN 1 ELSE 0 END) AS police_wins,
        ROUND(AVG(total_turns), 2) AS avg_turns
      FROM GameStats
    `);

    // 2) Query aggregated player stats
    // Adjust to match your PlayerStats table columns (e.g., jewels_stolen, arrests_made, role, etc.)
    const result2 = await connection.execute(`
      SELECT 
        SUM(CASE WHEN role = 'Robber' THEN jewels_stolen ELSE 0 END) AS robber_total_jewels_stolen,
        ROUND(AVG(CASE WHEN role = 'Robber' THEN jewels_stolen END), 2) AS avg_jewels_stolen,
        SUM(arrests_made) AS total_arrests_made,
        ROUND(AVG(CASE WHEN role = 'Police' THEN arrests_made END), 2) AS avg_arrests_made
      FROM PlayerStats
    `);

    // OracleDB typically returns row data in result.rows
    const row = result.rows[0];    // e.g. [ total_games, robber_wins, police_wins, avg_turns ]
    const row2 = result2.rows[0]; // e.g. [ total_jewels_stolen, avg_jewels_stolen, total_arrests_made, avg_arrests_made ]

    return {
      totalGames: row[0],
      robberWins: row[1],
      policeWins: row[2],
      avgTurns: row[3],
      robberTotalJewelsStolen: row2[0],
      avgJewelsStolen: row2[1],
      totalArrests: row2[2],
      avgArrests: row2[3]
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
    // Example: top 10 robbers by jewels_stolen, descending
    const result = await connection.execute(`
      SELECT player_id, jewels_stolen, arrests_made
      FROM PlayerStats
      WHERE role = 'Robber'
      ORDER BY jewels_stolen DESC
      FETCH FIRST 10 ROWS ONLY
    `);
    return result.rows; // or format them as objects if needed
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
    // Example: top 10 police by arrests_made, descending
    const result = await connection.execute(`
      SELECT player_id, jewels_stolen, arrests_made
      FROM PlayerStats
      WHERE role = 'Police'
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


module.exports = { addGame, addPlayer, logTurn, getStats, getAllTimeStats, getTopRobbers,
  getTopPolice};


