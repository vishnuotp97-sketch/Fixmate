import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosInstance";
const fallback = ["Electrician ⚡", "Plumber 🔧", "Carpenter 🪚", "Painter 🎨", "AC Repair ❄️", "Appliance Repair 🧺", "Cleaner 🧹"];
export default function Home() {
  const [cats, setCats] = useState([]);
  useEffect(() => { api.get("/category").then((r) => setCats(r.data)).catch(() => {}); }, []);
  return (<>
    <section className="hero">
      <h1>Home repairs, <span>done right.</span></h1>
      <p>Book verified electricians, plumbers, carpenters, painters and technicians at your doorstep – all your essential needs in one place.</p>
      <div className="row center"><Link to="/services" className="btn">Browse services</Link><Link to="/register" className="btn ghost">Become a provider</Link></div>
    </section>
    <section className="section">
      <h2>Popular categories</h2>
      <div className="grid">
        {(cats.length ? cats : fallback.map((n) => ({ _id: n, name: n.split(" ").slice(0, -1).join(" "), icon: n.split(" ").pop() }))).map((c) => (
          <Link key={c._id} to={cats.length ? `/services?category=${c._id}` : "/services"} className="card cat">
            <div className="icon">{c.icon || "🛠️"}</div><h3>{c.name}</h3><p>{c.description}</p>
          </Link>))}
      </div>
    </section>
    <section className="section steps">
      {["Choose a service", "Pick a date & address", "Pro confirms & arrives", "Pay & leave a review"].map((s, i) => (
        <div key={s} className="card"><b className="num">{i + 1}</b><p>{s}</p></div>))}
    </section>
  </>);
}
