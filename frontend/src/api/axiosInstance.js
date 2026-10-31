import axios from "axios";
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:3000/api" });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem("access_token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
export const errMsg = (e) => e.response?.data?.message || "Something went wrong. Please try again.";
export default api;
