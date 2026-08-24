import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const savedUser = await AsyncStorage.getItem("user");
      if (savedUser) setUser(JSON.parse(savedUser));
      setLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login(email, password);
    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (name, email, password) => {
    const { data } = await authAPI.register(name, email, password);
    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "user"]);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
