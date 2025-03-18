const oracledb = require("oracledb");

const dbConfig = {
  user: "SYSTEM",
  password: "42",
  connectString: "localhost/FREE",
};

async function getConnection() {
  try {
    return await oracledb.getConnection(dbConfig);
  } catch (err) {
    console.error("Error connecting to DB:", err);
  }
}

module.exports = { getConnection };
