<script setup>
import axios from "axios";

const props = defineProps({
  intnr: {
    type: Object,
    default: "leer",
  },
  first_name: {
    type: Object,
    default: "leer",
  },
  last_name: {
    type: Object,
    default: "leer",
  },
  company_name: {
    type: Object,
    default: "leer",
  },
  country: {
    type: Object,
    default: "leer",
  },
  zip: {
    type: Object,
    default: "leer",
  },
  city: {
    type: Object,
    default: "leer",
  },
  street: {
    type: Object,
    default: "leer",
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
  isDelete: {
    type: Boolean,
    default: false,
  },
  evenRow: {
    type: Boolean,
    default: false,
  },
  reloadTable: {
    type: Function,
  },
});

const cssClass = props.evenRow ? "customer grey" : "customer";

const emit = defineEmits();
function closeEdit() {
  //trigger emited Event "edit" to set the id of edited customer
  emit("edit", props.intnr.columnValue);
}

function editDataSet(e) {
  const editFields = Array.from(e.target.closest("div").children);
  const error = {};

  const fieldsToEdit = editFields.reduce((obj, field, index) => {
    if (field.tagName.toLowerCase() === "input") {
      const tableColumnName = field.getAttribute("data-table-column");
      const plzPattern = /^(?=.*[1-9])[0-9]{5}$/;

      if (field.value !== props[tableColumnName].columnValue) {
        if (tableColumnName === "zip") {
          if (plzPattern.test(field.value)) {
            obj[tableColumnName] = {
              value: field.value,
              table: props[tableColumnName].tableName,
            };
          } else {
            error.state = true;
            error.msg = "Keine valide Postleitzahl";
          }
        } else {
          obj[tableColumnName] = {
            value: field.value,
            table: props[tableColumnName].tableName,
          };
        }
      }
    }
    return obj;
  }, {});

  if (error.state) {
    alert(error.msg);
  } else {
    if (Object.keys(fieldsToEdit).length !== 0) {
      axios
        .put(`https://localhost:3000/api/customer/${props.intnr.columnValue}`, {
          fieldsToEdit,
        })
        .then((response) => {
          alert(response.data.message);
          closeEdit();
          props.reloadTable();
        })
        .catch((error) => alert(error.response.data.message));
    }
  }
}
</script>

<template>
  <div :class="cssClass">
    <div class="dataCollumn">{{ intnr.columnValue }}</div>
    <div class="dataCollumn">{{ first_name.columnValue }}</div>
    <div class="dataCollumn">{{ last_name.columnValue }}</div>
    <div class="dataCollumn">
      {{ company_name.columnValue ? company_name.columnValue : "Privatperson" }}
    </div>
    <div class="dataCollumn">
      {{ country.columnValue }} {{ zip.columnValue }} {{ city.columnValue }}
      {{ street.columnValue }}
    </div>
    <div
      @click="$emit('edit', intnr.columnValue)"
      class="dataCollumn editCustomer"
    ></div>
    <div
      @click="$emit('delete', intnr.columnValue)"
      class="dataCollumn deleteCustomer"
    ></div>
  </div>

  <div v-if="isEdit" class="customerEdit">
    <div class="container">
      <input
        data-table-column="first_name"
        type="text"
        :value="first_name.columnValue"
      />
      <input
        :data-table-column="last_name.columnName"
        type="text"
        :value="last_name.columnValue"
      />
      <input
        :data-table-column="company_name.columnName"
        type="text"
        :value="company_name.columnValue"
      />
      <input
        :data-table-column="country.columnName"
        type="text"
        :value="country.columnValue"
      />
      <input
        :data-table-column="zip.columnName"
        type="text"
        :value="zip.columnValue"
      />
      <input
        :data-table-column="city.columnName"
        type="text"
        :value="city.columnValue"
      />
      <input
        :data-table-column="street.columnName"
        type="text"
        :value="street.columnValue"
      />
      <button v-on:click="editDataSet">Speichern</button>
      <button v-on:click="closeEdit" class="closeEdit">Abbrechen</button>
    </div>
  </div>
</template>
