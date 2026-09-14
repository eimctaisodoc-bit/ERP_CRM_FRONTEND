import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BACKEND_URL_Dev || import.meta.env.VITE_API_BACKEND_URL_PROD,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("Token");

  // console.log("SESSION TOKEN:", token);

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  // console.log("AUTH HEADER:", config.headers.Authorization);

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized access - redirecting to login page", error.response?.data.message);

      sessionStorage.setItem(
        "IsAutoLogOut",
        error.response?.data?.message || "Token Expire. Logout"
      );
      sessionStorage.removeItem("Token");
      sessionStorage.removeItem("isToken");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      window.location.replace("/");
    }

    return Promise.reject(error);
  }
);

export default api;