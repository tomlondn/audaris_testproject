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

    function validateData(validationFields) {
      return parsedCsvData.every((dataObj) => {
        return validationFields.every((field) => {
          if (["email", "contact_person_email"].includes(field)) {
            return emailPattern.test(dataObj[field]);
          } else if (["phone", "fax", "mobile_phone"].includes(field)) {
            return phoneFaxPattern.test(dataObj[field]);
          } else {
            return true;
          }
        });
      });
    }

    // handle final check to perform upload to api Endpoint
    function handlePerformUpload(validationFields, endpoint) {
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
        alert(
          "Upload Fehlgeschlagen - Falsche Datei oder (Telefonnummer/Fax oder Email in der CSV prüfen)"
        );
      }
      target.value = "";
    }

    switch (fileUploadMode) {
      case "customer":
        handlePerformUpload(
          ["email", "contact_person_email", "phone", "fax", "mobile_phone"],
          "/customers"
        );
        break;

      case "addresses":
        handlePerformUpload(["email", "phone", "fax"], "/addresses");
        break;

      case "contact_persons":
        handlePerformUpload(["email", "mobile_phone"], "/contacts");
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
