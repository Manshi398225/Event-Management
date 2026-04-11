import { useEffect, useState } from "react";
import { EventCard } from "../components/EventCard";
import { EventForm } from "../components/EventForm";
import { api, setAuthToken } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export const AdminDashboard = () => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    pendingRegistrations: 0
  });
  const [usersData, setUsersData] = useState({ users: [], registrations: 0 });
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadDashboard = async () => {
    try {
      setAuthToken(token);
      const [analyticsRes, usersRes, registrationsRes, eventsRes] = await Promise.all([
        api.get("/register/admin/analytics/summary"),
        api.get("/auth/users"),
        api.get("/register/admin/all"),
        api.get("/events")
      ]);

      setAnalytics(analyticsRes.data);
      setUsersData(usersRes.data);
      setRegistrations(registrationsRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load dashboard");
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [token]);

  const saveEvent = async (payload) => {
    setLoading(true);
    try {
      setAuthToken(token);
      if (editingEvent) {
        await api.put(`/events/${editingEvent._id}`, payload);
        setMessage("Event updated successfully");
      } else {
        await api.post("/events", payload);
        setMessage("Event created successfully");
      }
      setEditingEvent(null);
      loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save event");
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      setAuthToken(token);
      await api.delete(`/events/${eventId}`);
      setMessage("Event deleted successfully");
      loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || "Delete failed");
    }
  };

  const updateStatus = async (registrationId, status) => {
    try {
      setAuthToken(token);
      await api.put(`/register/admin/${registrationId}/status`, { status });
      setMessage(`Registration ${status}`);
      loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || "Status update failed");
    }
  };

  return (
    <section className="page">
      <div className="section-heading">
        <h1>Admin Dashboard</h1>
      </div>

      {message && <div className="info-banner">{message}</div>}

      <div className="grid stats-grid">
        <div className="card stat-card">
          <strong>{usersData.users.length}</strong>
          <span>Total Users</span>
        </div>
        <div className="card stat-card">
          <strong>{analytics.totalEvents}</strong>
          <span>Total Events</span>
        </div>
        <div className="card stat-card">
          <strong>{analytics.totalRegistrations}</strong>
          <span>Total Registrations</span>
        </div>
        <div className="card stat-card">
          <strong>{analytics.pendingRegistrations}</strong>
          <span>Pending Approvals</span>
        </div>
      </div>

      <EventForm
        currentEvent={editingEvent}
        onSubmit={saveEvent}
        onCancel={() => setEditingEvent(null)}
        loading={loading}
      />

      <div className="admin-grid">
        <div>
          <div className="section-heading">
            <h2>Manage Events</h2>
          </div>
          <div className="grid cards-grid">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                actions={
                  <div className="action-row">
                    <button className="ghost-button" onClick={() => setEditingEvent(event)}>Edit</button>
                    <button className="danger-button" onClick={() => deleteEvent(event._id)}>Delete</button>
                  </div>
                }
              />
            ))}
          </div>
        </div>

        <div className="stacked-panels">
          <div className="card table-card">
            <div className="section-heading">
              <h2>Registrations</h2>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Event</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((registration) => (
                    <tr key={registration._id}>
                      <td>{registration.userId?.name}</td>
                      <td>{registration.eventId?.title}</td>
                      <td>
                        <span className={`status-pill ${registration.status}`}>{registration.status}</span>
                      </td>
                      <td className="action-row">
                        <button className="ghost-button" onClick={() => updateStatus(registration._id, "approved")}>
                          Approve
                        </button>
                        <button className="danger-button" onClick={() => updateStatus(registration._id, "rejected")}>
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card table-card">
            <div className="section-heading">
              <h2>Users</h2>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData.users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td><span className={`status-pill ${user.role === "admin" ? "approved" : "registered"}`}>{user.role}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
