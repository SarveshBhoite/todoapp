import axios from "axios";

export const API = axios.create({
  baseURL: "http://192.168.1.11:5000",
  timeout:5000, // 🔥 IMPORTANT update below
});

// EXAMPLE:
// http://192.168.1.11:5000
// http://localhost:5000 (works only for web, not device)
