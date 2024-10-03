const mysql = require("mysql2");

// MySQL Connection Config
const db = mysql.createConnection({
  host: "localhost",
  // host: "mysql",
  port: 3306,
  user: "root",
  password: "example",
  database: "mydb",
});

// connect to Database
db.connect((err) => {
  if (err) {
    console.error("Fehler bei der Verbindung zur Datenbank: (server.js)", err);
    return;
  }
  console.log("Erfolgreich mit der MySQL-Datenbank verbunden.");
});

module.exports = db;
