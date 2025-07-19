const oracledb = require("oracledb");

const dbConfig = {
  user: process.env.DB_USER || "SYSTEM",
  password: process.env.DB_PASS || "42",
  connectString: process.env.DB_CONNECT_STRING || "localhost/FREE",
};

async function getConnection() {
  try {
    return await oracledb.getConnection(dbConfig);
  } catch (err) {
    console.error("Error connecting to DB:", err);
  }
}

module.exports = { getConnection };
