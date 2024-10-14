const express = require("express");
const router = express.Router();
const db = require("./db");

router.get("/", (req, res) => {
  res.send("Api");
});

// insert Customer
router.post("/customers", async (req, res) => {
  const csvCustomerData = req.body;
  const dataEntries = csvCustomerData.length;
  const dbConnection = await db.getConnection();

  // Beginn Transaction
  await dbConnection.beginTransaction();

  try {
    let index = 0;
    let duplicates = 0;

    for (const row of csvCustomerData) {
      const {
        intnr,
        type,
        first_name,
        last_name,
        contact_person_email,
        mobile_phone,
        birth_date,
        company_name,
        country,
        city,
        zip,
        fax,
        phone,
        street,
        email,
      } = row;

      // check if Customer already exists
      const existingCustomer = await checkDuplicates(
        "customer",
        ["intnr"],
        [intnr]
      );

      // if duplicate skip
      if (existingCustomer) {
        duplicates++;
        continue;
      }

      // only when customer actually exists
      index++;

      // Insert Customer
      const customerQuery = "INSERT INTO customer (intnr, type) VALUES(?, ?)";
      const [customerInsertResult] = await dbConnection.query(customerQuery, [
        intnr,
        type,
      ]);

      // Insert Addresses
      const addressQuery =
        "INSERT INTO addresses (company_name, customer_id, country, city, zip, fax, phone, street, email) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)";
      const [addressInsertResult] = await dbConnection.query(addressQuery, [
        company_name,
        customerInsertResult.insertId,
        country,
        city,
        zip,
        fax,
        phone,
        street,
        email,
      ]);

      // Insert Persons
      const contactPersonQuery =
        "INSERT INTO contact_persons (customer_id, first_name, last_name, email, mobile_phone, birth_date, address_id) VALUES(?, ?, ?, ?, ?, ?, ?)";
      await dbConnection.query(contactPersonQuery, [
        customerInsertResult.insertId,
        first_name,
        last_name,
        contact_person_email,
        mobile_phone,
        birth_date,
        addressInsertResult.insertId,
      ]);
    }

    // succes, commit Transaction
    await dbConnection.commit();
    console.log("Upload in die Datenbank Erfolgreich");

    // counted Dataentries for better message
    const messageText =
      index === dataEntries
        ? `Alle ${index} Kunden Datensätze wurden in die Datenbank eingetragen`
        : `${index} von ${dataEntries} Kunden Datensätzen wurden in die Datenbank eingetragen(${duplicates} Duplikate wurden gefunden)`;

    res.status(200).json({
      message: messageText,
    });
  } catch (err) {
    console.error("Fehler bei der Transaktion:", err);
    // Rollback on Error
    await dbConnection.rollback();
    return res.status(500).json({
      message:
        "Fehler beim Dateneintragen in der Datenbank. Prüfe deine CSV auf Richtigkeit und versuche es erneut.",
    });
  } finally {
    dbConnection.release();
  }
});

// get all Customer Route
router.get("/customer", (req, res) => {});

// Update one Customer Route
router.put("/customer/:id", (req, res) => {});

// Delete one Customer Route
router.delete("/customer/:id", (req, res) => {});

// insert Contact Persons Route
router.post("/contacts", async (req, res) => {
  const csvCustomerData = req.body;
  const dataEntries = csvCustomerData.length;
  const dbConnection = await db.getConnection();

  try {
    // Beginn Transaction
    await dbConnection.beginTransaction();

    let index = 0;
    let duplicates = 0;

    for (const row of csvCustomerData) {
      const { intnr, first_name, last_name, email, mobile_phone, birth_date } =
        row;

      // check if Contact Person already exists
      const existingContactPerson = await checkDuplicates(
        "contact_persons",
        ["first_name", "last_name", "email", "mobile_phone"],
        [first_name, last_name, email, mobile_phone]
      );

      if (existingContactPerson) {
        duplicates++;
        continue;
      }

      index++;

      // if exist select id of linked Customer
      const linkedCustomerQuery = "SELECT _id FROM `customer` WHERE intnr = ?";
      const [linkedCustomer] = await dbConnection.query(linkedCustomerQuery, [
        intnr,
      ]);

      if (linkedCustomer.length > 0) {
        // linked Address - there is no identifier in the CSV so always first Match
        const linkedAddressQuery =
          "SELECT _id FROM `addresses` WHERE customer_id = ? LIMIT 1";
        const [linkedAddress] = await dbConnection.query(linkedAddressQuery, [
          linkedCustomer[0]._id,
        ]);

        const contactPersonQuery =
          "INSERT INTO contact_persons (customer_id, first_name, last_name, email, mobile_phone, birth_date, address_id) VALUES(?, ?, ?, ?, ?, ?, ?)";
        await dbConnection.query(contactPersonQuery, [
          linkedCustomer[0]._id,
          first_name,
          last_name,
          email,
          mobile_phone,
          birth_date,
          linkedAddress[0]._id ? linkedAddress[0]._id : null,
        ]);
      } else {
        return res.json({
          message: `Upload nicht erfolgreich. CSV beinhaltet in Zeile ${index} eine Kontaktperson zu der kein Kunde existiert.`,
        });
      }
    }

    // succes, commit Transaction
    await dbConnection.commit();
    console.log("Upload in die Datenbank Erfolgreich");

    // counted Dataentries for better message
    const messageText =
      index === dataEntries
        ? `Alle ${index} Personen Datensätze wurden in die Datenbank eingetragen`
        : `${index} von ${dataEntries} Personen Datensätzen wurden in die Datenbank eingetragen(${duplicates} Duplikate gefunden)`;

    res.status(200).json({
      message: messageText,
    });
  } catch (err) {
    console.error("Fehler bei der Transaktion:", err);

    // Rollback on Error
    await dbConnection.rollback();
    res.status(500).json({
      message:
        "Fehler beim Dateneintragen in der Datenbank. Prüfe deine CSV auf Richtigkeit und versuche es erneut.",
    });
  } finally {
    dbConnection.release();
  }
});

// insert Addresses
router.post("/addresses", async (req, res) => {
  const csvCustomerData = req.body;
  const dataEntries = csvCustomerData.length;
  const dbConnection = await db.getConnection();

  try {
    // Beginn Transaction
    await dbConnection.beginTransaction();

    let index = 0;
    let duplicates = 0;

    for (const row of csvCustomerData) {
      const {
        company_name,
        intnr,
        country,
        city,
        zip,
        fax,
        phone,
        street,
        email,
      } = row;

      // check if Address Person already exists
      const existingAddress = await checkDuplicates(
        "contact_persons",
        ["first_name", "last_name", "email", "mobile_phone"],
        [first_name, last_name, email, mobile_phone]
      );

      if (existingContactPerson) {
        duplicates++;
        continue;
      }

      index++;

      // if exist select id of linked Customer
      const linkedCustomerQuery = "SELECT _id FROM `customer` WHERE intnr = ?";
      const [linkedCustomer] = await dbConnection.query(linkedCustomerQuery, [
        intnr,
      ]);

      if (linkedCustomer.length > 0) {
        // linked Address - there is no identifier in the CSV so always first Match
        const linkedAddressQuery =
          "SELECT _id FROM `addresses` WHERE customer_id = ? LIMIT 1";
        const [linkedAddress] = await dbConnection.query(linkedAddressQuery, [
          linkedCustomer[0]._id,
        ]);

        const contactPersonQuery =
          "INSERT INTO contact_persons (customer_id, first_name, last_name, email, mobile_phone, birth_date, address_id) VALUES(?, ?, ?, ?, ?, ?, ?)";
        await dbConnection.query(contactPersonQuery, [
          linkedCustomer[0]._id,
          first_name,
          last_name,
          email,
          mobile_phone,
          birth_date,
          linkedAddress[0]._id ? linkedAddress[0]._id : null,
        ]);
      } else {
        return res.json({
          message: `Upload nicht erfolgreich. CSV beinhaltet in Zeile ${index} eine Kontaktperson zu der kein Kunde existiert.`,
        });
      }
    }

    // succes, commit Transaction
    await dbConnection.commit();
    console.log("Upload in die Datenbank Erfolgreich");

    // counted Dataentries for better message
    const messageText =
      index === dataEntries
        ? `Alle ${index} Personen Datensätze wurden in die Datenbank eingetragen`
        : `${index} von ${dataEntries} Personen Datensätzen wurden in die Datenbank eingetragen(${duplicates} Duplikate gefunden)`;

    res.status(200).json({
      message: messageText,
    });
  } catch (err) {
    console.error("Fehler bei der Transaktion:", err);

    // Rollback on Error
    await dbConnection.rollback();
    res.status(500).json({
      message:
        "Fehler beim Dateneintragen in der Datenbank. Prüfe deine CSV auf Richtigkeit und versuche es erneut.",
    });
  } finally {
    dbConnection.release();
  }
});

// Funktions for multiple use

// search Duplicates
async function checkDuplicates(tableName, fields, values) {
  // check for existing Dataset
  const checkString = fields.map((elem) => `${elem} = ?`).join(" AND ");

  const query = `SELECT _id FROM ${tableName} WHERE ${checkString}`;
  const [checkDuplicates] = await db.query(query, values);

  return checkDuplicates.length > 0;
}

module.exports = router;
