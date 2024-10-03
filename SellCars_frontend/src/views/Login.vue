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
  console.log({
    email: userEmail.value,
    password: userPassword.value,
  });

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

        alert(response.message);
      }
    })
    .catch((error) => {
      userAuthentificationStore.toogleLogin(false);
      //loginErrorMessage.value = error.response.data.message;
      //console.log(loginErrorMessage.value);
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

      <p class="loginError">{{ loginErrorMessage }}</p>

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

      <p>{{ userAuthentificationStore.loginState }}</p>
      <p>{{ userAuthentificationStore.isLogin }}</p>
    </section>
  </div>
</template>
