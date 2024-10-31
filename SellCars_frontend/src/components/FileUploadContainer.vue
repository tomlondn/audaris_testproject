<script setup>
import axios from "axios";

const props = defineProps({
  uploadDesc: {
    type: String,
    default: "Upload",
  },
  uploadId: {
    type: String,
    default: "",
  },
  uploadMode: {
    type: String,
    default: "",
  },
});

const apiUploadEndpoint = "https://localhost:3000/api";

function handleFileUploadClick(e) {
  e.target.closest("div").querySelector("input").click();
}

function readUploadFile(e) {
  const target = e.target;
  const file = target.files[0];

  const fileReader = new FileReader();
  const fileUploadMode = props.uploadMode;

  fileReader.onload = (e) => {
    const rawCsvData = e.target.result;
    const csvFileLines = rawCsvData.split("\n");
    const csvCellsPerLine = csvFileLines.map((customer) =>
      customer.split(",").map((val) => val.replace(/^"|"$/g, "").trim())
    );
    const csvFields = csvCellsPerLine[0];

    const parsedCsvData = csvCellsPerLine.slice(1).map((column) => {
      return csvFields.reduce((obj, field, index) => {
        obj[field] = column[index];
        return obj;
      }, {});
    });

    // Data Validation ( E-Mail, Fax, Phone)
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneFaxPattern = /^\+?[0-9\s()-]{7,15}$/;
    const plzPattern = /^(?=.*[1-9])[0-9]{5}$/;
    const errorValues = [];

    function validateData(validationFields) {
      return parsedCsvData.every((dataObj, index) => {
        return validationFields.every((field) => {
          if (["email", "contact_person_email"].includes(field)) {
            if (!emailPattern.test(dataObj[field])) {
              errorValues.push(dataObj[field]);
            }

            return emailPattern.test(dataObj[field]);
          } else if (["phone", "fax", "mobile_phone"].includes(field)) {
            if (!phoneFaxPattern.test(dataObj[field])) {
              errorValues.push(dataObj[field]);
            }

            return phoneFaxPattern.test(dataObj[field]);
          } else if (field === "zip") {
            if (!plzPattern.test(dataObj[field])) {
              errorValues.push(dataObj[field]);
            }
            return plzPattern.test(dataObj[field]);
          } else {
            return true;
          }
        });
      });
    }

    // handle final check to perform upload to api Endpoint
    function handlePerformUpload(validationFields, fieldPattern, endpoint) {
      const validCsvFields = csvFields.every((field) =>
        fieldPattern.includes(field)
      );

      if (validCsvFields && csvFields.length === fieldPattern.length) {
        if (validateData(validationFields)) {
          axios
            .post(`${apiUploadEndpoint}${endpoint}`, parsedCsvData)
            .then((response) => {
              alert(response.data.message);
            })
            .catch((error) => {
              alert(error.response.data.message);
            });
        } else {
          alert(`Upload Fehlgeschlagen - Falsche Eingabe: (${errorValues[0]})`);
        }
        target.value = "";
      } else {
        alert("Falsche CSV / Falsche CSV Struktur");
      }
    }

    switch (fileUploadMode) {
      case "customer":
        handlePerformUpload(
          [
            "email",
            "contact_person_email",
            "phone",
            "fax",
            "mobile_phone",
            "zip",
          ],
          [
            "intnr",
            "type",
            "first_name",
            "last_name",
            "contact_person_email",
            "mobile_phone",
            "birth_date",
            "company_name",
            "country",
            "city",
            "zip",
            "fax",
            "phone",
            "street",
            "email",
          ],
          "/customers"
        );
        break;

      case "addresses":
        handlePerformUpload(
          ["email", "phone", "fax", "zip"],
          [
            "intnr",
            "company_name",
            "country",
            "city",
            "zip",
            "fax",
            "phone",
            "street",
            "email",
          ],
          "/addresses"
        );
        break;

      case "contact_persons":
        handlePerformUpload(
          ["email", "mobile_phone"],
          [
            "intnr",
            "first_name",
            "last_name",
            "email",
            "mobile_phone",
            "birth_date",
          ],
          "/contacts"
        );
        break;

      default:
        break;
    }
  };
  fileReader.readAsText(file);
}
</script>
<template>
  <div class="upload-container" v-on:click="handleFileUploadClick">
    <p class="uploadDesc">{{ props.uploadDesc }}</p>
    <input
      class="fileUpload"
      :id="props.uploadDesc"
      type="file"
      accept=".csv"
      v-on:change="readUploadFile"
    />
  </div>
</template>
