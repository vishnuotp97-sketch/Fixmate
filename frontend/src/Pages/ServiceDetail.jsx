import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api, { errMsg } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
export default function ServiceDetail() {
  const { id } = useParams(); const { user } = useAuth(); const nav = useNavigate();
  const [s, setS] = useState(null); const [reviews, setReviews] = useState([]); const [err, setErr] = useState(""); const [ok, setOk] = useState("");
  const [f, setF] = useState({ bookingDate: "", address: "", notes: "" });
  useEffect(() => {
    api.get(`/services/${id}`).then((r) => setS(r.data)).catch(() => setErr("Service not found"));
    api.get(`/review/service/${id}`).then((r) => setReviews(r.data)).catch(() => {});
  }, [id]);
  const book = async (e) => {
    e.preventDefault(); setErr(""); setOk("");
    if (!user) return nav("/login");
    try { await api.post("/bookings", { ...f, serviceId: id }); setOk("Booking requested! Track it in your dashboard."); setF({ bookingDate: "", address: "", notes: "" }); }
    catch (x) { setErr(errMsg(x)); }
  };
  if (!s) return <section className="section">{err ? <div className="alert">{err}</div> : <p className="muted">Loading...</p>}</section>;
  const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null;
  return (<section className="section two">
    <div className="card">
      <span className="tag">{s.category?.name}</span><h2>{s.title}</h2>
      <p>{s.description}</p><p><b>₹{s.price}</b> · 📍 {s.location}</p>
      <p className="muted">Provider: {s.provider?.name} {s.provider?.phone && `· 📞 ${s.provider.phone}`}</p>
      <h3>Reviews {avg && `· ⭐ ${avg} (${reviews.length})`}</h3>
      {!reviews.length && <p className="muted">No reviews yet.</p>}
      {reviews.map((r) => <div key={r._id} className="review"><b>{r.customer?.name}</b> {"⭐".repeat(r.rating)}<p>{r.comment}</p></div>)}
    </div>
    <form className="card form" onSubmit={book}>
      <h3>Book this service</h3>
      {err && <div className="alert">{err}</div>}{ok && <div className="alert good">{ok}</div>}
      {user && user.role !== "customer" ? <p className="muted">Only customer accounts can book services.</p> : (<>
        <label>Date &amp; time<input type="datetime-local" value={f.bookingDate} onChange={(e) => setF({ ...f, bookingDate: e.target.value })} required /></label>
        <label>Address<input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} required /></label>
        <label>Notes<textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></label>
        <button className="btn" disabled={!s.availability}>{s.availability ? (user ? "Request booking" : "Login to book") : "Unavailable"}</button>
        {!user && <p className="muted"><Link to="/register">Create an account</Link></p>}
      </>)}
    </form>
  </section>);
}
