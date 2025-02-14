const { getConnection } = require("./database");
const oracledb = require('oracledb');


async function createGame() {
    const connection = await getConnection();
    if (!connection) return;

    try {
    const result = await connection.execute(
        `INSERT INTO GameStats (total_turns, winner) 
        VALUES (0, NULL) RETURNING game_id INTO :game_id`,
        { game_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } },
        { autoCommit: true }
    );

    console.log("New game created with ID:", result.outBinds.game_id[0]);
    return result.outBinds.game_id[0]; // Return the game ID for further use
    } catch (err) {
    console.error("Error inserting game:", err);
    } finally {
    await connection.close();
    }
    }

async function addPlayer(gameId, role, jewels = 0, arrests = 0) {
    const connection = await getConnection();
    if (!connection) return;
  
    try {
      await connection.execute(
        `INSERT INTO PlayerStats (game_id, role, jewels_stolen, arrests_made) 
         VALUES (:game_id, :role, :jewels, :arrests)`,
        { game_id: gameId, role, jewels, arrests },
        { autoCommit: true }
      );
  
      console.log(`Player added to game ${gameId} as ${role}`);
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

module.exports = { createGame, addPlayer, logTurn };

