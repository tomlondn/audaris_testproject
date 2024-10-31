<script setup>
import axios from "axios";

const props = defineProps({
  intnr: {
    type: String,
    required: true,
  },
  contact_persons: {
    type: Object,
    required: true,
  },
  addresses: {
    type: Array,
    required: true,
  },
  evenRow: {
    type: Boolean,
    default: false,
  },
  company_name: {
    type: String,
    required: true,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
  isDelete: {
    type: Boolean,
    default: false,
  },
  reloadTable: {
    type: Function,
    required: true,
  },
});

const cssClass = props.evenRow ? "customer grey" : "customer";

const emit = defineEmits(["edit", "delete"]);
function closeEdit() {
  //trigger emited Event "edit"
  emit("edit", props.intnr);
}

function editDataSet(e) {
  const editFields = Array.from(
    e.target.closest("div").querySelectorAll("input")
  );
  const error = {};

  const fieldsToEdit = editFields.reduce((obj, field, index) => {
    const tableColumnName = field.getAttribute("data-table-column");
    const plzPattern = /^(?=.*[1-9])[0-9]{5}$/;
    const addressId = parseInt(field.getAttribute("data-addressId")); // AddressId holen und als Zahl parsen

    // Prüfen, ob die AddressId vorhanden ist
    if (addressId) {
      const address = props.addresses.find(
        (addr) => addr.address_id === addressId
      );

      // Falls eine Übereinstimmung für die Adresse gefunden wurde
      if (address && address[tableColumnName] !== field.value) {
        if (tableColumnName === "zip") {
          if (plzPattern.test(field.value)) {
            if (!obj[addressId]) {
              obj[addressId] = {};
            }

            obj[addressId][tableColumnName] = field.value;
          } else {
            error.state = true;
            error.msg = "Keine valide Postleitzahl";
          }
        } else {
          if (!obj[addressId]) {
            obj[addressId] = {};
          }

          obj[addressId][tableColumnName] = field.value;
        }
      }
    }

    // contact Person
    if (tableColumnName in props.contact_persons) {
      if (props.contact_persons[tableColumnName] !== field.value) {
        obj[tableColumnName] = {
          value: field.value,
          table: "contact_persons",
        };
      }
    }

    return obj;
  }, {});

  console.log(fieldsToEdit);

  if (error.state) {
    alert(error.msg);
  } else {
    if (Object.keys(fieldsToEdit).length !== 0) {
      axios
        .put(`https://localhost:3000/api/customer/${props.intnr}`, {
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
    <div class="dataCollumn">{{ intnr }}</div>
    <div class="dataCollumn">{{ contact_persons.first_name }}</div>
    <div class="dataCollumn">{{ contact_persons.last_name }}</div>

    <div class="dataCollumn">
      {{
        addresses[0].company_name ? addresses[0].company_name : "Privatperson"
      }}
    </div>

    <div class="dataCollumn">
      <div v-for="(address, index) in addresses">
        <div>Addresse {{ index + 1 }}:</div>
        {{ address.country }} {{ address.zip }} {{ address.city }}
        {{ address.street }}
      </div>
    </div>

    <div @click="$emit('edit', intnr)" class="dataCollumn editCustomer"></div>
    <div
      @click="$emit('delete', intnr)"
      class="dataCollumn deleteCustomer"
    ></div>
  </div>

  <div v-if="isEdit" class="customerEdit">
    <div class="container">
      <input
        data-table-column="first_name"
        type="text"
        :value="contact_persons.first_name"
      />

      <input
        data-table-column="last_name"
        type="text"
        :value="contact_persons.last_name"
      />

      <div
        v-for="(
          { company_name, country, zip, city, street, address_id }, index
        ) in addresses"
      >
        <br />Adresse {{ index + 1 }}<br />
        <input
          :data-addressId="address_id"
          data-table-column="company_name"
          type="text"
          :value="company_name"
        />

        <input
          :data-addressId="address_id"
          data-table-column="country"
          type="text"
          :value="country"
        />

        <input
          :data-addressId="address_id"
          data-table-column="zip"
          type="text"
          :value="zip"
        />
        <input
          :data-addressId="address_id"
          data-table-column="city"
          type="text"
          :value="city"
        />
        <input
          :data-addressId="address_id"
          data-table-column="street"
          type="text"
          :value="street"
        />
      </div>

      <button v-on:click="editDataSet">Speichern</button>
      <button v-on:click="closeEdit" class="closeEdit">Abbrechen</button>
    </div>
  </div>
</template>
