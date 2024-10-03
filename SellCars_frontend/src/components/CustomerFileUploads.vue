<script setup>
import FileUploadContainer from "./FileUploadContainer.vue";
</script>
<template>
  <section class="cutomer-file-uploads">
    <header>
      <h1 class="customerpage-headline">Customer CSV Uploads</h1>
    </header>

    <FileUploadContainer
      upload-desc="Upload customer"
      upload-id="uploadCustomer"
      upload-mode="customer"
    />
    <FileUploadContainer
      upload-desc="Upload contact persons"
      upload-id="uploadContactPersons"
      upload-mode="contact_persons"
    />
    <FileUploadContainer
      upload-desc="Upload addresses"
      upload-id="uploadAdresses"
      upload-mode="addresses"
    />
  </section>
</template>
