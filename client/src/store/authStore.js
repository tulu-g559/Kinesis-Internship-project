import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  role: localStorage.getItem("role") || null,

  login: (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", user.role || "user");

    set({
      user,
      token,
      role: user.role || "user"
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    set({
      user: null,
      token: null,
      role: null
    });
  },

  isAdmin: () => {
    return localStorage.getItem("role") === "admin";
  }
}));

export default useAuthStore;