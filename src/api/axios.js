import axios from "axios";

const baseURL = import.meta.env.DEV
  ? import.meta.env.VITE_API_BACKEND_URL_Dev || "http://localhost:5000"
  : import.meta.env.VITE_API_BACKEND_URL_PROD || "";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

const inFlightRequests = new Map();
const blobRequestIds = new WeakMap();
const defaultAdapter = axios.getAdapter(api.defaults.adapter);
let activeApiRequests = 0;
let nextBlobRequestId = 0;

const getBlobRequestId = (blob) => {
  if (!blobRequestIds.has(blob)) {
    nextBlobRequestId += 1;
    blobRequestIds.set(blob, nextBlobRequestId);
  }

  return blobRequestIds.get(blob);
};

const requestKey = (config) => {
  let data = config.data;

  if (typeof FormData !== "undefined" && data instanceof FormData) {
    data = Array.from(data.entries()).map(([name, value]) => [
      name,
      typeof Blob !== "undefined" && value instanceof Blob
        ? getBlobRequestId(value)
        : value
    ]);
  }

  return JSON.stringify([
    config.method,
    api.getUri(config),
    config.headers?.Authorization,
    config.headers?.["Content-Type"],
    typeof data === "string" ? data : JSON.stringify(data)
  ]);
};

const publishApiActivity = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("api-activity", {
      detail: { activeRequests: activeApiRequests }
    }));
  }
};

api.defaults.adapter = (config) => {
  const key = requestKey(config);
  const pendingRequest = inFlightRequests.get(key);

  if (pendingRequest) {
    return pendingRequest;
  }

  activeApiRequests += 1;
  publishApiActivity();

  const request = Promise.resolve()
    .then(() => defaultAdapter(config))
    .finally(() => {
      inFlightRequests.delete(key);
      activeApiRequests -= 1;
      publishApiActivity();
    });

  inFlightRequests.set(key, request);
  return request;
};

export const getActiveApiRequestCount = () => activeApiRequests;

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("Token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});



api.interceptors.response.use(
  (response) => response,

  (error) => {
    const url = error.config?.url || "";
    const status = error.response?.status;
    const responseData = error.response?.data || {};

    const message =
      responseData.message ||
      responseData.error ||
      "";

    const code = responseData.code;
    const errorType = responseData.error;

    const isLoginRequest = url.includes("/api/auth/login");

    // ==========================================
    // CUSTOM ERP AUTHENTICATION ERROR ONLY
    // ==========================================

    const isAccountDeleted =
      status === 404 &&
      (
        code === "ACCOUNT_REVOKED" ||
        message.toLowerCase() === "user not found"
      );

    const isCustomAuthError =
      !isLoginRequest &&
      (
        status === 401 ||
        isAccountDeleted
      );

    // ==========================================
    // EXCLUDE GOOGLE DRIVE AUTHENTICATION
    // ==========================================

    const isGoogleAuthError =
      errorType === "GOOGLE_AUTH_EXPIRED" ||
      code === "invalid_grant" ||
      errorType === "invalid_grant";

    if (isGoogleAuthError) {
      return Promise.reject(error);
    }

    // ==========================================
    // ERP AUTO LOGOUT
    // ==========================================

    if (isCustomAuthError) {
      console.error("ERP AUTHENTICATION ERROR:", {
        url,
        status,
        message,
        code,
        response: responseData,
      });

      sessionStorage.setItem(
        "IsAutoLogOut",
        isAccountDeleted
          ? "Your account has been deleted. Please contact the administrator."
          : message || "Authentication failed. Please log in again."
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