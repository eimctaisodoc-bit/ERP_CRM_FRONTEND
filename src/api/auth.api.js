import api from "./axios";

export const loginUser = async (data) => {
  const res = await api.post("/api/auth/login", data, { withCredentials: true });
  return res.data;
};


export const getMe = async () => {
  const res = await api.get("/api/auth/me", { withCredentials: true });
  console.log('User data:', res.data);
  return res.data;
};

export const logoutUser = async () => {
  const { data } = await api.post("/api/auth/logout");
  return data;
};

export const userById = async (params) => {
  // const { id } = params
  // console.log("Fetching user with ID:", params.params);
  const { data } = await api.get(`/api/users/${params.params}`);
  return data;
};