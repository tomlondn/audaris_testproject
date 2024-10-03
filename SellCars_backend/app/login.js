const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const db = require("./db");

router.use(cookieParser());

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

// Middleware to authenticate the user by verifying the JWT
const authenticateToken = (req, res, next) => {
  const token = req.cookies.login;
  if (!token) {
    return res.status(403).json({ message: "Token fehlt" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Ungültiger Token" });
    }
    req.user = { lastLogin: user.lastLogin, username: user.username };
    next();
  });
};

// login get Home Route (just to set one)
router.get("/", (req, res) => {
  res.send("Login Validation Seite");
});

// Login route
router.post("/", (req, res) => {
  const { email, password: enteredPasswordHash } = req.body;

  // select user login data from the database
  const query =
    "SELECT password_hash, first_name, last_name  FROM `backend_admin` WHERE email = ?"; // Hier auch die Spalten anpassen
  db.query(query, [email], (err, dbLoginData) => {
    if (err) {
      console.error("Fehler bei der Abfrage:", err);
      return res.status(500).json({ message: "Interner Serverfehler" });
    }

    // Validate login
    const isAuthUser =
      !(dbLoginData.length === 0) &&
      enteredPasswordHash === dbLoginData[0].password_hash;

    if (isAuthUser) {
      // Update "updatet_at" after login validation

      const updateQuery =
        "UPDATE `backend_admin` SET updatet_at = NOW() WHERE email = ?";
      db.query(updateQuery, [email], (err) => {
        if (err) {
          console.error("Fehler bei der Abfrage:", err);
          return res.status(500).json({ message: "Interner Serverfehler" });
        }

        // get userData after Update(get new Updatet login Datetime)
        const dataQuery =
          "SELECT first_name, last_name, CONVERT_TZ(updatet_at, '+00:00', 'Europe/Berlin') AS updatet_at FROM `backend_admin` WHERE email = ?";

        db.query(dataQuery, [email], (err, userData) => {
          if (err) {
            console.error("Fehler bei der Abfrage:", err);
            return res.status(500).json({ message: "Interner Serverfehler" });
          }

          console.log(userData[0]);

          const fullName = `${userData[0].first_name} ${userData[0].last_name}`;

          // Create JWT Token
          const token = jwt.sign(
            { lastLogin: userData[0].updatet_at, username: fullName },
            JWT_SECRET,
            { expiresIn: "1y" }
          );

          // Create cookie
          res.cookie("login", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 30 * 24 * 60 * 60 * 1000,
          });

          return res.status(200).json({ message: "Login OK" });
        });
      });
    } else {
      return res.status(403).json({ message: "Falsch Login Daten" });
    }
  });
});

// GET-Route for Token Authentification
router.post("/check-auth", authenticateToken, (req, res) => {
  res.status(200).json({
    lastLogin: req.user.lastLogin,
    userName: req.user.username,
    message: "Authentifizierung erfolgreich",
  });
});

module.exports = router;
