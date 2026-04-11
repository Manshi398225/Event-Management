import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="shell">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark">E</span>
          <div>
            <strong>Event Management System</strong>
            <p>Cloud-ready college event operations</p>
          </div>
        </Link>

        <nav className="nav">
          <NavLink to="/">Events</NavLink>
          {user?.role === "student" && <NavLink to="/my-events">My Events</NavLink>}
          {user?.role === "admin" && <NavLink to="/admin">Dashboard</NavLink>}
          {user && <NavLink to="/profile">Profile</NavLink>}
        </nav>

        <div className="topbar-actions">
          {user ? (
            <>
              <div className="user-pill">
                <span>{user.name}</span>
                <small>{user.role}</small>
              </div>
              <button className="ghost-button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="ghost-button link-button" to="/login">Login</Link>
              <Link className="primary-button link-button" to="/register">Register</Link>
            </>
          )}
        </div>
      </header>

      <main className="main-content">{children}</main>
    </div>
  );
};
