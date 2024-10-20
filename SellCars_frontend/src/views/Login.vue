<script setup>
import axios from "axios";
import { userAuthentification } from "../../store/store";
import { ref } from "vue";
import router from "@/router";
import CryptoJS from "crypto-js";

const userAuthentificationStore = userAuthentification();
const userEmail = ref("");
const userPassword = ref("");

function tryLogin() {
  axios
    .post(
      "https://localhost:3000/login",
      {
        email: userEmail.value,
        password: generateHash(userPassword.value),
      },
      { withCredentials: true }
    )
    .then((response) => {
      if (response.status === 200) {
        userAuthentificationStore.toogleLogin(true);
        router.push("/customer-page");
      }

      alert(response.data.message);
    })
    .catch((error) => {
      userAuthentificationStore.toogleLogin(false);
      alert(error.response.data.message);
    });
}

const handleSubmit = (event) => {
  event.preventDefault();
};

function generateHash(enteredPasswort) {
  return CryptoJS.SHA256(enteredPasswort).toString().substring(0, 32);
}
</script>
<template>
  <div class="loginWrapper">
    <section class="container">
      <header><h1>SellCars</h1></header>

      <form @submit="handleSubmit">
        <div>
          <input
            id="userEmail"
            type="text"
            placeholder="Email / Username"
            v-model="userEmail"
          />
        </div>

        <div>
          <input
            type="password"
            id="userPassword"
            v-model="userPassword"
            placeholder="Password"
          />
        </div>
        <button v-on:click="tryLogin">Login</button>
      </form>
    </section>
  </div>
</template>
