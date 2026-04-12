import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import EventCard from "../components/EventCard";
import ToastStack from "../components/ToastStack";
import useAuth from "../hooks/useAuth";

const createToast = (title, message, type = "info") => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  title,
  message,
  type,
});

function HomePage() {
  const { isAuthenticated, token, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [toasts, setToasts] = useState([]);

  const pushToast = (title, details, type) => {
    const nextToast = createToast(title, details, type);
    setToasts((current) => [...current, nextToast]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== nextToast.id));
    }, 4500);
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/events");
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase());
      const matchesDate = !dateFilter || new Date(event.date).toISOString().slice(0, 10) === dateFilter;
      const matchesCategory = !categoryFilter || event.category === categoryFilter;
      const matchesLocation = !locationFilter || event.location === locationFilter;

      return matchesSearch && matchesDate && matchesCategory && matchesLocation;
    });
  }, [events, search, dateFilter, categoryFilter, locationFilter]);

  const categories = useMemo(
    () => [...new Set(events.map((event) => event.category).filter(Boolean))],
    [events]
  );
  const locations = useMemo(
    () => [...new Set(events.map((event) => event.location).filter(Boolean))],
    [events]
  );

  const handleRegister = async (eventId) => {
    try {
      setMessage("");
      setError("");
      setRegisteringId(eventId);
      const data = await apiRequest(`/register/${eventId}`, {
        method: "POST",
        token,
      });
      setMessage(data.message);
      pushToast("Registration submitted", data.message, "success");
      loadEvents();
    } catch (err) {
      setError(err.message);
      pushToast("Unable to register", err.message, "error");
    } finally {
      setRegisteringId("");
    }
  };

  return (
    <section className="page-section">
      <ToastStack onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} toasts={toasts} />
      <div className="hero card hero-card">
        <div>
          <span className="pill">College Event Platform</span>
          <h1>Organize, discover, and manage campus events in one place.</h1>
          <p>
            Students can browse and register in seconds, while admins get full control over event
            creation, approvals, and analytics.
          </p>
        </div>
        <div className="hero-highlight">
          <div>
            <strong>Role-based</strong>
            <span>Student and admin dashboards</span>
          </div>
          <div>
            <strong>Cloud-ready</strong>
            <span>Built for MongoDB Atlas and Render deployment</span>
          </div>
          <div>
            <strong>Responsive</strong>
            <span>Clean UI with white and light-blue theme</span>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="input"
          placeholder="Search by event title"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <input
          className="input"
          type="date"
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
        />
        <select className="input" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select className="input" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
          <option value="">All locations</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <Loader label="Loading campus events..." />
      ) : filteredEvents.length === 0 ? (
        <EmptyState title="No events found" message="Try a different search or add a new event." />
      ) : (
        <div className="grid cards-grid">
          {filteredEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              action={
                user?.role === "student" ? (
                  <button
                    className="button"
                    disabled={event.status === "Full" || registeringId === event._id}
                    onClick={() => handleRegister(event._id)}
                    type="button"
                  >
                    {registeringId === event._id ? "Registering..." : event.status === "Full" ? "Event Full" : "Register"}
                  </button>
                ) : !isAuthenticated ? (
                  <Link className="button" to="/login">
                    Login to Register
                  </Link>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default HomePage;
