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
  console.log(role, lootWorth, robbersCaught);
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
    console.log(`Player added with role ${role}`);
  } catch (err) {
    console.error("Error adding player:", err);
  } finally {
    await connection.close();
  }
}


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

        console.log(`Turn ${turnNum} logged for game ${gameId}`);
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

module.exports = { addGame, addPlayer, logTurn, getStats };


