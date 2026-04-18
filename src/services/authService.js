import api from "./api";

export function login(payload) {
  return api.post("/users/login", payload);
}

export function register(payload) {
  return api.post("/users/register", payload);
}

export function getMe() {
  return api.get("/users/me");
}
