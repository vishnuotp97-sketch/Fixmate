import { BrowserRouter, Routes, Route, NavLink, Link, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./Pages/Home";
import { Login, Register } from "./Pages/Auth";
import Services from "./Pages/Services";
import ServiceDetail from "./Pages/ServiceDetail";
import Dashboard from "./Pages/Dashboard";

function Nav() {
  const { user, logout } = useAuth();
  return (
    <nav className="nav">
      <Link to="/" className="brand">🛠️ Fix<span>mate</span></Link>
      <div className="links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/services">Services</NavLink>
        {user ? (<>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <button className="btn small ghost" onClick={logout}>Logout ({user.name.split(" ")[0]})</button>
        </>) : (<>
          <NavLink to="/login">Login</NavLink>
          <Link to="/register" className="btn small">Sign up</Link>
        </>)}
      </div>
    </nav>
  );
}
function Private({ children }) { const { user } = useAuth(); return user ? children : <Navigate to="/login" replace />; }

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="footer">© {new Date().getFullYear()} Fixmate – trusted electricians, plumbers, carpenters &amp; more.</footer>
      </BrowserRouter>
    </AuthProvider>
  );
}
