import { Link, NavLink, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function AppLayout() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container nav-bar">
          <Link className="brand" to="/">
            Cloud EMS
          </Link>

          <nav className="nav-links">
            <NavLink to="/">Events</NavLink>
            <NavLink to="/calendar">Calendar</NavLink>
            {isAuthenticated && user?.role === "student" && <NavLink to="/my-events">My Events</NavLink>}
            {isAuthenticated && <NavLink to="/profile">Profile</NavLink>}
            {user?.role === "admin" && <NavLink to="/admin/dashboard">Dashboard</NavLink>}
            {user?.role === "admin" && <NavLink to="/admin/events">Manage Events</NavLink>}
            {user?.role === "admin" && <NavLink to="/admin/registrations">Registrations</NavLink>}
          </nav>

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <span className="welcome-text">{user?.name}</span>
                <button className="button secondary" onClick={logout} type="button">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="button ghost" to="/login">
                  Login
                </Link>
                <Link className="button" to="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
