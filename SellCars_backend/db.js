const mysql = require("mysql2/promise");

// MySQL Connection
const db = mysql.createPool({
  // host: "localhost",
  host: "mysql",
  port: 3306,
  user: "root",
  password: "example",
  database: "mydb",
});

const ceckConnect = async () => {
  try {
    const connection = await db.getConnection();
    await connection.query("SELECT 1");
    console.log("Erfolgreich mit der MySQL-Datenbank verbunden.");
    connection.release();
  } catch (err) {
    console.error("Fehler bei der Verbindung zur Datenbank:", err);
    throw err;
  }
};
ceckConnect();

module.exports = db;
