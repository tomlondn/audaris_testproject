const fs = require("fs");
const https = require("https");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const loginPage = require("./login");
const { DateTime } = require("luxon");
//process.env.TZ = "Europe/Berlin";

// create Express App
const app = express();

const options = {
  key: fs.readFileSync("../cercs/server.key"),
  cert: fs.readFileSync("../cercs/server.cer"),
};

app.use(
  cors({
    origin: "https://localhost:3001",
    credentials: true,
  })
);
app.use(express.json());

app.get("/check-time", (req, res) => {
  const utcTime = DateTime.now().toUTC(); // UTC-Zeit
  const berlinTime = DateTime.now(); // Berlin-Zeit
  res.json({
    utcTime: utcTime.toISO(),
    berlinTime: berlinTime.toISO(),
    timezone: berlinTime.zoneName,
  });
});

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

// Login Route
app.use("/login", loginPage);

// Home Route
app.get("/", (req, res) => {
  console.log(new Date());
  res.send("Home");
});

// Start Server
const PORT = process.env.PORT || 3000;

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
