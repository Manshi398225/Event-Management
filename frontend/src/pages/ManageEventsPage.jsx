import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import Loader from "../components/Loader";
import useAuth from "../hooks/useAuth";

const initialForm = {
  title: "",
  description: "",
  category: "General",
  date: "",
  location: "",
  capacity: 50,
};

function ManageEventsPage() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchEvents = async () => {
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
    fetchEvents();
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError("");
      setMessage("");
      if (editingId) {
        await apiRequest(`/events/${editingId}`, {
          method: "PUT",
          token,
          body: form,
        });
        setMessage("Event updated successfully");
      } else {
        await apiRequest("/events", {
          method: "POST",
          token,
          body: form,
        });
        setMessage("Event created successfully");
      }
      resetForm();
      fetchEvents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (event) => {
    setEditingId(event._id);
    setForm({
      title: event.title,
      description: event.description,
      category: event.category,
      date: new Date(event.date).toISOString().slice(0, 16),
      location: event.location,
      capacity: event.capacity,
    });
  };

  const handleDelete = async (id) => {
    try {
      setError("");
      setMessage("");
      await apiRequest(`/events/${id}`, {
        method: "DELETE",
        token,
      });
      setMessage("Event deleted successfully");
      fetchEvents();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="page-section admin-grid">
      <form className="card event-form-card" onSubmit={handleSubmit}>
        <h2>{editingId ? "Edit Event" : "Create Event"}</h2>
        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}
        <label>
          Title
          <input className="input" name="title" value={form.title} onChange={handleChange} required />
        </label>
        <label>
          Description
          <textarea
            className="input textarea"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Category
          <input className="input" name="category" value={form.category} onChange={handleChange} required />
        </label>
        <label>
          Date & Time
          <input className="input" name="date" type="datetime-local" value={form.date} onChange={handleChange} required />
        </label>
        <label>
          Location
          <input className="input" name="location" value={form.location} onChange={handleChange} required />
        </label>
        <label>
          Capacity
          <input className="input" name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} required />
        </label>
        <div className="inline-actions">
          <button className="button" type="submit">
            {editingId ? "Update Event" : "Create Event"}
          </button>
          {editingId && (
            <button className="button secondary" onClick={resetForm} type="button">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="event-list-panel">
        <div className="section-heading">
          <h1>Manage Events</h1>
          <p>Create, edit, and remove events from your college schedule.</p>
        </div>
        {loading ? (
          <Loader label="Loading events..." />
        ) : (
          <div className="grid cards-grid">
            {events.map((event) => (
              <article className="card" key={event._id}>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <div className="event-meta">
                  <span>{new Date(event.date).toLocaleString()}</span>
                  <span>{event.location}</span>
                  <span>{event.category}</span>
                  <span>{event.capacity} capacity</span>
                </div>
                <div className="inline-actions">
                  <button className="button" onClick={() => handleEdit(event)} type="button">
                    Edit
                  </button>
                  <button className="button secondary" onClick={() => handleDelete(event._id)} type="button">
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ManageEventsPage;
