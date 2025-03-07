const { query } = require("express");
const { getConnection } = require("./database");
const oracledb = require('oracledb');


async function addGame(total_turns, winner) {
  const connection = await getConnection();
  if (!connection) return;

  try {
      // Insert the row
        search = `INSERT INTO GameStats (total_turns, winner) VALUES (:total_turns, :winner)`;
        const binds = {
          total_turns: total_turns,
          winner: winner
        };
        await connection.execute(search, binds, { autoCommit: true });
      /*
      // Retrieve the generated game_id
      const search = `SELECT game_id FROM GameStats WHERE game_id = (SELECT MAX(game_id) FROM GameStats)`;
      const result = await connection.execute(search, [], { resultSet: true });

      // Fetch the first row from the result set
      const row = await result.resultSet.getRow();

      if (row) {
        const gameId = row[0];  // game_id is the first column of the row
        console.log("Inserted gameId:", gameId);
        return gameId;
      } else {
        console.error("No game_id found.");
      } */

  } catch (err) {
      console.error("Error inserting game:", err);
  } finally {
      if (connection) await connection.close();
  }
}


async function addPlayer(gameId, role, jewels = 0, arrests = 0) {
    const connection = await getConnection();
    if (!connection) return;
    console.log(role, jewels, arrests);
    try {
      search =
        `INSERT INTO PlayerStats (game_id, role, jewels_stolen, arrests_made) 
         VALUES ((SELECT MAX(game_id) FROM GameStats), :role, :jewels, :arrests)`;
        const binds =  {
          role: role,
          jewels: jewels,
          arrests: arrests
        };
        await connection.execute(search, binds, { autoCommit: true });
  
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

module.exports = { addGame, addPlayer, logTurn };

