import { createContext, useContext, useState } from "react";
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } });
  const login = (u, token) => { localStorage.setItem("access_token", token); localStorage.setItem("user", JSON.stringify(u)); setUser(u); };
  const logout = () => { localStorage.removeItem("access_token"); localStorage.removeItem("user"); setUser(null); };
  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}
