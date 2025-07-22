const { getConnection } = require('./database');
(async () => {
  const conn = await getConnection();
  if (!conn) {
    console.error('Unable to connect to Oracle DB. Check DB_USER, DB_PASS and DB_CONNECT_STRING in .env');
    process.exit(1);
  }
  console.log('Successfully connected to Oracle DB');
  await conn.close();
})();
