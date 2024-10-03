const express = require("express");
const router = express.Router();
const db = require("./db");

router.get("/", (req, res) => {
  res.send("Api");
});

// insert Customer
router.post("/customer-insert", (req, res) => {
  const csvCustomerData = req.body;

  csvCustomerData.forEach((row) => {
    const {
      intnr,
      type,
      first_name,
      last_name,
      contact_person_email,
      mobile_phone,
      birth_date,
      country,
      city,
      zip,
      fax,
      phone,
      street,
      email,
    } = row;

    const customerQuery =
      "INSERT INTO customer (intnr, type,first_name, last_name, contact_person_email, mobile_phone, birth_date, country, city, zip, fax, phone, street, email) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ";
  });
});

// insert Contact Persons
router.post("/contact_persons-insert", (req, res) => {
  console.log(req.body);
});

// insert Addresses
router.post("/addresses-insert", (req, res) => {
  console.log(req.body);
});

// get all Customer
router.get("/all-customer", (req, res) => {});

// Update one Customer
// Delete Customer

module.exports = router;
