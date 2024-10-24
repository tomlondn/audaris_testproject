<script setup>
import { onMounted, reactive, ref } from "vue";
import oneCustomer from "./oneCustomer.vue";
import axios from "axios";

const customerSearchString = ref("");
const allCustomer = ref(null);
const customerEditId = ref(null);
const customerDeleteId = ref(null);
const isSortOrder = ref("DESC");
// for sorting
let originalCustomer;

function getAllCustomerData() {
  axios
    .get("https://localhost:3000/api/customer")
    .then((response) => {
      allCustomer.value = response.data;
      originalCustomer = response.data;
    })
    .catch((error) => {
      console.log(error.response);
    });
}

function searchInCustomer(e) {
  customerSearchString.value = e.target.value;
  const flattCustomerObj = flattenCustomerObj();

  const filteredObj = flattCustomerObj.filter((customer) =>
    Object.values(customer).some((value) =>
      value.toLowerCase().includes(customerSearchString.value.toLowerCase())
    )
  );

  allCustomer.value = unflattenCustomerObj(filteredObj);
}

function editOneCustomer(customerIntnr) {
  if (customerIntnr === customerEditId.value) {
    customerEditId.value = null;
  } else {
    customerEditId.value = customerIntnr;
  }
}
function deleteOneCustomer(customerIntnr) {
  if (customerIntnr === customerDeleteId.value) {
    customerDeleteId.value = null;
  } else {
    customerDeleteId.value = customerIntnr;
  }

  const doDelete = confirm("Wollen sie diesen Kunden wirklich löschen?");

  if (doDelete) {
    axios
      .delete(
        `https://localhost:3000/api/customer/${customerDeleteId.value}`,
        {}
      )
      .then((response) => {
        alert(response.data.message);
        getAllCustomerData();
      })
      .catch((error) => alert(error.response.data.message));
  }
}

function columnAscDescSort(e) {
  const columnToSort = e.target.getAttribute("column_name");
  const flatenObj = flattenCustomerObj();

  // Flexible DESC / ASC
  let sortedArr;

  switch (isSortOrder.value) {
    case "ASC":
      sortedArr = flatenObj.sort((a, b) => {
        const vA = a[columnToSort];
        const vB = b[columnToSort];
        console.log("A", vA);
        console.log("B", vB);

        return vA.localeCompare(vB);
      });
      isSortOrder.value = "DESC";
      break;

    case "DESC":
      sortedArr = flatenObj.sort((a, b) => {
        const vA = a[columnToSort];
        const vB = b[columnToSort];
        console.log("A", vA);
        console.log("B", vB);

        return vB.localeCompare(vA);
      });
      isSortOrder.value = "ASC";
      break;

    default:
      sortedArr = flatenObj.sort((a, b) => {
        const vA = a[columnToSort];
        const vB = b[columnToSort];
        console.log("A", vA);
        console.log("B", vB);

        return vA.localeCompare(vB);
      });
  }

  allCustomer.value = unflattenCustomerObj(flatenObj);
}

function flattenCustomerObj() {
  const customer = originalCustomer;

  return customer.map((c) => {
    if (c.addresses.company_name === "") {
      c.addresses.company_name = "Privatperson";
    }

    return {
      intnr: c.intnr,
      ...c.contact_persons,
      ...c.addresses,
    };
  });
}
function unflattenCustomerObj(flattObj) {
  return flattObj.map((c) => {
    return {
      intnr: c.intnr,
      contact_persons: {
        first_name: c.first_name,
        last_name: c.last_name,
      },
      addresses: {
        company_name: c.company_name,
        country: c.country,
        zip: c.zip,
        city: c.city,
        street: c.street,
      },
    };
  });
}

onMounted(() => {
  getAllCustomerData();
});
</script>
<template>
  <section class="customer-overview">
    <header>
      <h1 class="customerpage-headline">Customer List</h1>
    </header>

    <div class="search">
      <input
        id="customerSearch"
        type="text"
        placeholder="Search by all Columns"
        v-model="customerSearchString"
        v-on:input="searchInCustomer"
      />
      {{ customerSearchString }}
    </div>
    <div class="customerList">
      <div class="overviewHeader">
        <div
          @click="columnAscDescSort"
          column_name="intnr"
          class="headerCollumn"
        >
          #
        </div>
        <div
          @click="columnAscDescSort"
          column_name="first_name"
          class="headerCollumn"
        >
          First
        </div>
        <div
          @click="columnAscDescSort"
          column_name="last_name"
          class="headerCollumn"
        >
          Last
        </div>
        <div
          @click="columnAscDescSort"
          column_name="company_name"
          class="headerCollumn"
        >
          Company Name
        </div>
        <div column_name="" class="headerCollumn">Address</div>
        <div class="headerCollumn">Edit</div>
        <div column_name="" class="headerCollumn">Delete</div>
      </div>
      <div v-if="allCustomer">
        <oneCustomer
          v-for="(customer, index) in allCustomer"
          :evenRow="(index + 1) % 2 === 0"
          :intnr="{ columnName: 'intnr', columnValue: customer.intnr }"
          :first_name="{
            columnName: 'first_name',
            columnValue: customer.contact_persons.first_name,
            tableName: 'contact_persons',
          }"
          :last_name="{
            columnName: 'last_name',
            columnValue: customer.contact_persons.last_name,
            tableName: 'contact_persons',
          }"
          :company_name="{
            columnName: 'company_name',
            columnValue: customer.addresses.company_name,
            tableName: 'addresses',
          }"
          :country="{
            columnName: 'country',
            columnValue: customer.addresses.country,
            tableName: 'addresses',
          }"
          :zip="{
            columnName: 'zip',
            columnValue: customer.addresses.zip,
            tableName: 'addresses',
          }"
          :city="{
            columnName: 'city',
            columnValue: customer.addresses.city,
            tableName: 'addresses',
          }"
          :street="{
            columnName: 'street',
            columnValue: customer.addresses.street,
            tableName: 'addresses',
          }"
          :isEdit="customer.intnr === customerEditId"
          :isDelete="customer.intnr === customerDeleteId"
          @edit="editOneCustomer"
          @delete="deleteOneCustomer"
          :reloadTable="getAllCustomerData"
        >
        </oneCustomer>
      </div>
      <div v-else>Loading...</div>
    </div>
  </section>
</template>
