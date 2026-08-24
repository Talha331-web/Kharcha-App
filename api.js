import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// IMPORTANT: replace with your deployed backend URL before building for production
// e.g. "https://kharcha-api.onrender.com/api"
//
// "10.0.2.2" ONLY works on the Android Emulator. On a real phone (Expo Go),
// the phone and your PC must be on the SAME WiFi network, and this must be
// your PC's local network IP (run `ipconfig` on Windows, look for IPv4 Address
// under "Wireless LAN adapter Wi-Fi").
export const BASE_URL = "http://192.168.1.XX:5000/api"; // <-- replace 192.168.1.XX with your PC's IPv4 address

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // fail after 10s instead of hanging forever if the server is unreachable
});

// Attach the saved JWT token to every request automatically
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: (name, email, password) => api.post("/auth/register", { name, email, password }),
  login: (email, password) => api.post("/auth/login", { email, password }),
};

export const transactionAPI = {
  parseSms: (text) => api.post("/transactions/parse-sms", { text }),
  previewSms: (text) => api.post("/transactions/preview-sms", { text }),
  addManual: (data) => api.post("/transactions", data),
  list: (month) => api.get("/transactions", { params: month ? { month } : {} }),
  update: (id, data) => api.patch(`/transactions/${id}`, data),
  remove: (id) => api.delete(`/transactions/${id}`),
  summary: (month) => api.get("/transactions/summary/monthly", { params: month ? { month } : {} }),
};

export default api;
