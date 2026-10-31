import { useCallback, useEffect, useState } from "react";
import api, { errMsg } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
const fmt = (d) => new Date(d).toLocaleString();
const Badge = ({ s }) => <span className={`badge ${s}`}>{s}</span>;

function Customer() {
  const [list, setList] = useState([]); const [err, setErr] = useState(""); const [rv, setRv] = useState({});
  const load = useCallback(() => api.get("/bookings/customer").then((r) => setList(r.data)).catch((e) => setErr(errMsg(e))), []);
  useEffect(() => { load(); }, [load]);
  const review = async (b) => {
    try { await api.post("/review/create", { bookingId: b._id, rating: Number(rv[b._id]?.rating || 5), comment: rv[b._id]?.comment || "" }); load(); }
    catch (e) { setErr(errMsg(e)); }
  };
  return (<><h2>My bookings</h2>{err && <div className="alert">{err}</div>}{!list.length && <p className="muted">No bookings yet.</p>}
    {list.map((b) => (<div key={b._id} className="card">
      <h3>{b.service?.title} <Badge s={b.status} /></h3><p>{fmt(b.bookingDate)} · {b.address}</p><p className="muted">Provider: {b.provider?.name} {b.provider?.phone}</p>
      {b.status === "completed" && !b.reviewed && (<div className="row">
        <select onChange={(e) => setRv({ ...rv, [b._id]: { ...rv[b._id], rating: e.target.value } })} defaultValue="5">{[5, 4, 3, 2, 1].map((n) => <option key={n}>{n}</option>)}</select>
        <input placeholder="Write a review" onChange={(e) => setRv({ ...rv, [b._id]: { ...rv[b._id], comment: e.target.value } })} />
        <button className="btn small" onClick={() => review(b)}>Submit review</button></div>)}
    </div>))}</>);
}

function Provider() {
  const [bookings, setB] = useState([]); const [mine, setMine] = useState([]); const [cats, setCats] = useState([]); const [err, setErr] = useState("");
  const blank = { title: "", description: "", price: "", location: "", category: "" }; const [f, setF] = useState(blank);
  const load = useCallback(() => {
    api.get("/bookings/provider").then((r) => setB(r.data)).catch((e) => setErr(errMsg(e)));
    api.get("/services/mine").then((r) => setMine(r.data)).catch(() => {});
  }, []);
  useEffect(() => { load(); api.get("/category").then((r) => setCats(r.data)); }, [load]);
  const act = (p, body) => api.patch(`/bookings/${p}`, body).then(load).catch((e) => setErr(errMsg(e)));
  const add = async (e) => { e.preventDefault(); try { await api.post("/services", { ...f, price: Number(f.price) }); setF(blank); load(); } catch (x) { setErr(errMsg(x)); } };
  const toggle = (s) => api.put(`/services/${s._id}`, { availability: !s.availability }).then(load);
  const del = (s) => api.delete(`/services/${s._id}`).then(load);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (<>{err && <div className="alert">{err}</div>}
    <h2>Booking requests</h2>{!bookings.length && <p className="muted">No requests yet.</p>}
    {bookings.map((b) => (<div key={b._id} className="card">
      <h3>{b.service?.title} <Badge s={b.status} /></h3><p>{b.customer?.name} · {b.customer?.phone} · {fmt(b.bookingDate)}</p><p className="muted">{b.address} {b.notes && `— ${b.notes}`}</p>
      <div className="row">
        {b.status === "pending" && <><button className="btn small" onClick={() => act(`${b._id}/respond`, { status: "accepted" })}>Accept</button><button className="btn small ghost" onClick={() => act(`${b._id}/respond`, { status: "rejected" })}>Reject</button></>}
        {b.status === "accepted" && <button className="btn small" onClick={() => act(`${b._id}/complete`)}>Mark completed</button>}
      </div></div>))}
    <h2>My services</h2>
    {mine.map((s) => (<div key={s._id} className="card row between"><span><b>{s.title}</b> · ₹{s.price} · {s.category?.name}</span>
      <span className="row"><button className="btn small ghost" onClick={() => toggle(s)}>{s.availability ? "Pause" : "Resume"}</button><button className="btn small ghost" onClick={() => del(s)}>Delete</button></span></div>))}
    <form className="card form" onSubmit={add}><h3>Add a service</h3>
      <label>Category<select value={f.category} onChange={set("category")} required><option value="">Select</option>{cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></label>
      <label>Title<input value={f.title} onChange={set("title")} required /></label>
      <label>Description<textarea value={f.description} onChange={set("description")} required /></label>
      <label>Price (₹)<input type="number" min="0" value={f.price} onChange={set("price")} required /></label>
      <label>Location<input value={f.location} onChange={set("location")} required /></label>
      <button className="btn">Add service</button></form></>);
}

function Admin() {
  const [cats, setCats] = useState([]); const [f, setF] = useState({ name: "", description: "", icon: "" }); const [err, setErr] = useState("");
  const load = useCallback(() => api.get("/category").then((r) => setCats(r.data)), []);
  useEffect(() => { load(); }, [load]);
  const add = async (e) => { e.preventDefault(); setErr(""); try { await api.post("/category", f); setF({ name: "", description: "", icon: "" }); load(); } catch (x) { setErr(errMsg(x)); } };
  return (<><h2>Categories</h2>{err && <div className="alert">{err}</div>}
    {cats.map((c) => <div key={c._id} className="card row between"><span>{c.icon} <b>{c.name}</b> <span className="muted">{c.description}</span></span><button className="btn small ghost" onClick={() => api.delete(`/category/${c._id}`).then(load)}>Delete</button></div>)}
    <form className="card form" onSubmit={add}><h3>Add category</h3>
      <label>Name<input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></label>
      <label>Icon (emoji)<input value={f.icon} onChange={(e) => setF({ ...f, icon: e.target.value })} /></label>
      <label>Description<input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
      <button className="btn">Add</button></form></>);
}

export default function Dashboard() {
  const { user } = useAuth();
  return (<section className="section"><h1>Hi, {user.name} <span className="tag">{user.role}</span></h1>
    {user.role === "provider" ? <Provider /> : user.role === "admin" ? <Admin /> : <Customer />}</section>);
}
