import { defineStore } from "pinia";

export const userAuthentification = defineStore("login", {
  state: () => ({
    isLogin: false,
    lastLogin: null,
    userLoginName: "",
  }),
  actions: {
    toogleLogin(isLogin) {
      this.isLogin = isLogin;
    },
    setUserData({ lastLogin, userName }) {
      this.lastLogin = lastLogin;
      this.userLoginName = userName;
    },
  },
  getters: {
    loginState: (state) => {
      if (state.isLogin) {
        return "Eingelogt";
      } else {
        return "Nicht Eingelogt";
      }
    },
  },
});
