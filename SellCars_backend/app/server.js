const fs = require("fs");
const https = require("https");
const express = require("express");
const cors = require("cors");
const loginPage = require("./login");
const api = require("./api");

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

// Login Route
app.use("/login", loginPage);

// Api Route
app.use("/api", api);

// Home Route
app.get("/", (req, res) => {
  res.send("Home");
});

// Start Server
const PORT = process.env.PORT || 3000;

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
