<script setup>
import { ref } from "vue";

const customerSearchString = ref("");
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
      />
    </div>
  </section>
</template>
