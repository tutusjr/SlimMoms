// authActions.js: Login ve register API isteklerini yöneten fonksiyonlar.

import axios from "axios";
import {
  loginSuccess,
  logout,
  setUser,
  kcalKeeper,
  setIsAuthenticated,
} from "./authSlice";
import { toast, Bounce } from "react-toastify";
const API_URL = "https://diary-list-node-api.onrender.com/api/auth";

export const login = (email, password) => async (dispatch) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });

    await dispatch(
      loginSuccess({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      })
    );
    toast.success("Giriş başarılı", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    });
  } catch (error) {
    toast.error("Kullanıcı veya şifre yanlış", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    });
    console.error("Giriş hatası", error);
  }
};

export const getUser = (token) => async (dispatch) => {
  // try {
  if (!token) {
    await dispatch(setIsAuthenticated(false));
    return { success: false };
  }

  const response = await axios.get(`${API_URL}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 200 || response.status === 201) {
    const userData = response.data.data.user;
    const refreshToken = response.data.data.refreshToken;
    dispatch(
      setUser({
        user: userData,
        refreshToken,
      })
    );
    return { success: true };
  }
  return { success: false };
  // } catch (error) {
  //   console.error("Kullanıcı bilgisi alma hatası:", error);
  //   if (error.response && error.response.status === 401) {
  //     dispatch(logout());
  //   }
  //   return { success: false, error };
  // }
};

export const register = (name, email, password) => async () => {
  try {
    await axios.post(`${API_URL}/register`, { name, email, password });
  } catch (error) {
    console.error("Register error:", error);
  }
};

export const logoutUser = () => (dispatch) => {
  dispatch(logout());
};

export const calculaterUser = (formData, token) => async (dispatch) => {
  try {
    const response = await axios.patch(`${API_URL}/userInfo`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    await dispatch(
      kcalKeeper({
        dailyRate: response.data.data.dailyRate,
      })
    );

    return response.data;
  } catch (error) {
    console.error("Error updating user info:", error);
    dispatch({
      type: "UPDATE_USER_INFO_FAILURE",
      payload: error.response ? error.response.data : error.message,
    });
  }
};
