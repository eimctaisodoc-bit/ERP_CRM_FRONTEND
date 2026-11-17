// src/utils/auth.js

import { useAuth } from "./hooks/useAuth";

export const getSessionUser = () => {
  try {
    const userString = sessionStorage.getItem('user');


    if (!userString) return null;


    return JSON.parse(userString);
  } catch (error) {
    console.error("Error parsing session user:", error);
    return null;
  }
};

export const useSessionAuth = () => {

  let currentUser;
  try {
    const stored = sessionStorage.getItem("user");
    const parsed = stored ? JSON.parse(stored) : null;
    currentUser = parsed && typeof parsed === "object"
      ? parsed
      : {};
  } catch {
    currentUser = {};
  }

  const auth = useAuth(currentUser?.id);
  const { data: { user: { decoded } = {} } = {} } = auth.useMe;
  const userDetails = auth.MewithID.data || {};
  /* console.log("Decoded user:", auth?.isAuthLoading); */

  const isLoading = auth.isAuthLoading;

  return {
    ...auth,
    currentUser,
    decoded,
    role: decoded?.role || null,
    userDetails,
    isLoading,
  };
};