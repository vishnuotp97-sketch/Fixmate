import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axiosInstance";
export default function Services() {
  const [sp, setSp] = useSearchParams();
  const [cats, setCats] = useState([]); const [list, setList] = useState([]); const [state, setState] = useState("loading");
  const category = sp.get("category") || "", q = sp.get("q") || "";
  useEffect(() => { api.get("/category").then((r) => setCats(r.data)).catch(() => {}); }, []);
  useEffect(() => {
    setState("loading");
    api.get("/services", { params: { category, q } }).then((r) => { setList(r.data); setState("ok"); }).catch(() => setState("error"));
  }, [category, q]);
  const upd = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n); };
  return (<section className="section">
    <h2>Find a service</h2>
    <div className="row">
      <input placeholder="Search e.g. leak, wiring..." value={q} onChange={(e) => upd("q", e.target.value)} />
      <select value={category} onChange={(e) => upd("category", e.target.value)}><option value="">All categories</option>{cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
    </div>
    {state === "loading" && <p className="muted">Loading...</p>}
    {state === "error" && <div className="alert">Could not reach the server. Is the backend running?</div>}
    {state === "ok" && !list.length && <p className="muted">No services found.</p>}
    <div className="grid">{list.map((s) => (
      <Link key={s._id} to={`/services/${s._id}`} className="card">
        <span className="tag">{s.category?.name}</span><h3>{s.title}</h3>
        <p className="muted">{s.description}</p>
        <p><b>₹{s.price}</b> · 📍 {s.location}</p>
        <p className="muted">by {s.provider?.name} {s.availability ? "" : "· Unavailable"}</p>
      </Link>))}</div>
  </section>);
}
