const express = require("express");
const router = express.Router();
const db = require("./db");

router.get("/", (req, res) => {
  res.send("Api");
});

// Upload Customer Route
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
      const existingCustomer = await checkForExistingDataset(
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
        ? `Alle ${index} Kundendatensätze wurden in die Datenbank eingetragen`
        : `${index} von ${dataEntries} Kundendatensätzen wurden in die Datenbank eingetragen(${duplicates} Duplikate wurden gefunden)`;

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
router.get("/customer", async (req, res) => {
  const dbConnection = await db.getConnection();

  try {
    // Selct all Customer
    const allCustomerSelectQuery = `SELECT customer.intnr, contact_persons.first_name, contact_persons.last_name, addresses.company_name, addresses._id as address_id , addresses.country, addresses.zip, addresses.city, addresses.street FROM customer LEFT JOIN contact_persons ON customer._id = contact_persons.customer_id LEFT JOIN addresses ON customer._id = addresses.customer_id WHERE contact_persons.address_id IS NOT NULL`;

    const [customerSelectData] = await dbConnection.query(
      allCustomerSelectQuery
    );

    const customerData = customerSelectData.reduce((acc, customer) => {
      const intnr = customer.intnr;

      if (!acc[intnr]) {
        acc[intnr] = {
          intnr: intnr,
          contact_persons: {
            first_name: customer.first_name,
            last_name: customer.last_name,
          },
          addresses: [],
        };
      }

      acc[intnr].addresses.push({
        country: customer.country,
        zip: customer.zip,
        city: customer.city,
        street: customer.street,
        address_id: customer.address_id,
        company_name: customer.company_name,
      });

      return acc;
    }, {});

    res.status(200).json(Object.values(customerData));
  } catch (error) {
    res.status(500).json({
      message:
        "Beim Abfruf der Daten aus der Datenbank ist ein Fehler aufgetreten",
    });
  } finally {
    dbConnection.release();
  }
});

// Update one Customer Route
router.put("/customer/:id", async (req, res) => {
  const allFieldsToUpdate = req.body.fieldsToEdit;
  const customerEditId = req.params.id;

  const dbConnection = await db.getConnection();

  try {
    await dbConnection.beginTransaction();

    // if exist select id of linked Customer
    const existCustomerQuery = "SELECT _id FROM `customer` WHERE intnr = ?";
    const [existingCustomer] = await dbConnection.query(existCustomerQuery, [
      customerEditId,
    ]);

    if (existingCustomer.length > 0) {
      const customerId = existingCustomer[0]._id;

      for (const key in allFieldsToUpdate) {
        const fieldData = allFieldsToUpdate[key];

        if (parseInt(key)) {
          const addressId = key;
          const tableFieldsToUpdateSet = Object.keys(fieldData)
            .map((field) => `${field} = ?`)
            .join(", ");
          const updateValues = Object.values(fieldData);
          const setQueryValues = [...updateValues, addressId];

          const updateQuary = `UPDATE addresses SET ${tableFieldsToUpdateSet} WHERE _id = ?`;
          await dbConnection.query(updateQuary, setQueryValues);
        } else {
          const { value, table } = fieldData;
          const setQueryValues = [value, customerId];

          const updateQuary = `UPDATE ${table} SET ${key} = ? WHERE customer_id = ?`;

          await dbConnection.query(updateQuary, setQueryValues);
        }
      }

      // save update timestamp
      const updateTimeQuary =
        "UPDATE customer SET updatet_at = NOW() WHERE intnr = ?";
      await dbConnection.query(updateTimeQuary, customerEditId);

      //succes;
      await dbConnection.commit();
      res.status(200).json({
        message: `Felder für Kunden mit der Nummer ${customerEditId} wurden Erfolgreich aktualisiert`,
      });
    } else {
      res.status(404).json({
        message: "Kunde nicht gefunden",
      });
    }
  } catch (err) {
    console.error("Fehler bei der Transaktion:", err);

    // Rollback on Error
    await dbConnection.rollback();
    res.status(500).json({
      message: "Fehler beim Update in der Datenbank",
    });
  } finally {
    db.releaseConnection();
  }
});

// Delete one Customer Route
router.delete("/customer/:id", async (req, res) => {
  const dbConnection = await db.getConnection();
  const customerToDelete = req.params.id;
  console.log(customerToDelete);

  try {
    //if exist select id of Customer
    const existCustomerQuery = "SELECT _id FROM `customer` WHERE intnr = ?";
    const [existCustomer] = await dbConnection.query(existCustomerQuery, [
      customerToDelete,
    ]);

    if (existCustomer.length !== 0) {
      const deleteQquery = "DELETE FROM customer WHERE intnr = ? ";
      await db.query(deleteQquery, [customerToDelete]);

      res.status(200).json({
        message: `Kunde mit der Nummer ${customerToDelete} wurde erfolgreich gelöscht`,
      });
    } else {
      res.status(400).json({
        message: `Kein Kunde mit der Nummer ${customerToDelete} gefunden`,
      });
    }
  } catch (error) {
    console.error("Interner Server Fehler", error);
    res
      .status(500)
      .json({ message: "Fehler in der Datenbank beim Löschvorgang." });
  }
});

// Upload Contact Persons Route
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
      const existingContactPerson = await checkForExistingDataset(
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
        const contactPersonQuery =
          "INSERT INTO contact_persons (customer_id, first_name, last_name, email, mobile_phone, birth_date) VALUES(?, ?, ?, ?, ?, ?)";
        await dbConnection.query(contactPersonQuery, [
          linkedCustomer[0]._id,
          first_name,
          last_name,
          email,
          mobile_phone,
          birth_date,
        ]);
      } else {
        return res.json({
          message: `Upload nicht erfolgreich. CSV beinhaltet in Zeile ${index} eine Kontaktperson zu der kein Kunde existiert.`,
        });
      }
    }

    // success, commit Transaction
    await dbConnection.commit();
    console.log("Upload in die Datenbank Erfolgreich");

    // counted Dataentries Message
    const messageText =
      index === dataEntries
        ? `Alle ${index} Personendatensätze wurden in die Datenbank eingetragen`
        : `${index} von ${dataEntries} Personendatensätzen wurden in die Datenbank eingetragen(${duplicates} Duplikate gefunden)`;

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

// Upload Addresses Route
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

      // check if Address already exists
      const existingAddress = await checkForExistingDataset(
        "addresses",
        ["company_name", "street", "zip", "phone", "country"],
        [company_name, street, zip, phone, country]
      );

      if (existingAddress) {
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
        // Linked Contact Person - Null bc no Identifier in CSV
        // Maybe based on Customer but in some or maybe most cases it doesnt make sense
        // For this case i said in DB it can be null
        const linkedContactPerson = null;

        // Insert Adress
        const addressQuery =
          "INSERT INTO addresses (company_name, customer_id, contact_person_id, country, city, zip, fax, phone, street, email) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        await dbConnection.query(addressQuery, [
          company_name,
          linkedCustomer[0]._id,
          linkedContactPerson,
          country,
          city,
          zip,
          fax,
          phone,
          street,
          email,
        ]);
      } else {
        return res.json({
          message: `Upload nicht erfolgreich. CSV beinhaltet in Zeile ${index} eine Adresse zu der kein Kunde existiert.`,
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
        : `${index} von ${dataEntries} Adressdatensätzen wurden in die Datenbank eingetragen(${duplicates} Duplikate gefunden)`;

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
async function checkForExistingDataset(tableName, fields, values) {
  // check for existing Dataset
  const checkString = fields.map((elem) => `${elem} = ?`).join(" AND ");
  const query = `SELECT _id FROM ${tableName} WHERE ${checkString}`;
  const [duplicates] = await db.query(query, values);

  return duplicates.length > 0;
}

module.exports = router;
