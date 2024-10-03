<script setup>
import { watchEffect } from "vue";
import { userAuthentification } from "../../store/store";
import CustomerList from "@/components/CustomerList.vue";
import CustomerFileUpload from "@/components/CustomerFileUploads.vue";
const userAuthentificationStore = userAuthentification();
let dateFormat = "";

watchEffect(() => {
  const date = new Date(userAuthentificationStore.lastLogin);

  dateFormat = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${date.toTimeString().slice(0, 8)}`;
});
</script>

<template>
  <div>
    <div v-if="userAuthentificationStore.isLogin">
      <div class="loggedInUser">
        <p>{{ userAuthentificationStore.userLoginName }}</p>
        <p class="lastLogin">Last Login: {{ dateFormat }}</p>
      </div>

      <div class="customerpage-wrapper">
        <CustomerFileUpload />
        <CustomerList />
      </div>
    </div>
    <div v-else>Sie sind nicht mehr eingeloggt</div>
  </div>
</template>

<style></style>
