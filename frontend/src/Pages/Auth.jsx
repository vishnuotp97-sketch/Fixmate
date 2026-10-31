import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errMsg } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

function useForm(path, initial, done) {
  const [f, setF] = useState(initial); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const { login } = useAuth(); const nav = useNavigate();
  const set = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try { const { data } = await api.post(path, f); login(data.user, data.token); nav(done); }
    catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };
  return { f, set, err, busy, submit };
}
export function Login() {
  const { f, set, err, busy, submit } = useForm("/authservices/login", { email: "", password: "" }, "/dashboard");
  return (
    <form className="card form" onSubmit={submit}>
      <h2>Welcome back</h2><p className="muted">Login to your Fixmate account</p>
      {err && <div className="alert">{err}</div>}
      <label>Email<input type="email" name="email" value={f.email} onChange={set} required /></label>
      <label>Password<input type="password" name="password" value={f.password} onChange={set} required /></label>
      <button className="btn" disabled={busy}>{busy ? "Logging in..." : "Login"}</button>
      <p className="muted">New here? <Link to="/register">Create an account</Link></p>
    </form>);
}
export function Register() {
  const { f, set, err, busy, submit } = useForm("/authservices/register", { name: "", email: "", password: "", phone: "", location: "", role: "customer" }, "/dashboard");
  return (
    <form className="card form" onSubmit={submit}>
      <h2>Create account</h2><p className="muted">Book home services easily – or offer your own.</p>
      {err && <div className="alert">{err}</div>}
      <label>I want to<select name="role" value={f.role} onChange={set}><option value="customer">Book services</option><option value="provider">Offer services (provider)</option></select></label>
      <label>Full name<input name="name" value={f.name} onChange={set} required /></label>
      <label>Email<input type="email" name="email" value={f.email} onChange={set} required /></label>
      <label>Password (min 6)<input type="password" name="password" minLength={6} value={f.password} onChange={set} required /></label>
      <label>Phone<input name="phone" value={f.phone} onChange={set} /></label>
      <label>Location<input name="location" value={f.location} onChange={set} /></label>
      <button className="btn" disabled={busy}>{busy ? "Creating..." : "Register"}</button>
      <p className="muted">Already registered? <Link to="/login">Login</Link></p>
    </form>);
}
