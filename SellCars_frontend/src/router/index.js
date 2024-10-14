import { createRouter, createWebHistory } from "vue-router";
import axios from "axios";
import Login from "../views/Login.vue";
import CustomerPage from "@/views/CustomerPage.vue";
import Parent from "@/components/Parent.vue";
import { userAuthentification } from "../../store/store";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      redirect: "/login",
    },
    {
      path: "/customer-page",
      name: "Customer Page",
      component: CustomerPage,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "Login",
      component: Login,
    },
    {
      path: "/practice",
      name: "practice",
      component: Parent,
    },
  ],
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = userAuthentification();

  axios
    .post(
      "https://localhost:3000/login/check-auth",
      {},
      { withCredentials: true }
    )
    .then((response) => {
      if (response.status === 200) {
        authStore.toogleLogin(true);
        authStore.setUserData(response.data);

        if (to.matched.some((record) => record.meta.requiresAuth)) {
          if (!authStore.isLogin) {
            next({ name: "Login" });
          } else {
            next();
          }
        } else {
          if (to.name === "Login" && authStore.isLogin) {
            next({ name: "Customer Page" });
          } else {
            next();
          }
        }
      } else {
        authStore.toogleLogin(false);
      }
    })
    .catch((err) => {
      console.error(err);
      next();
    });
});

export default router;
