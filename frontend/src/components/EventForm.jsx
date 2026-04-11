import { useEffect, useState } from "react";

const initialState = {
  title: "",
  description: "",
  date: "",
  location: "",
  capacity: 50
};

export const EventForm = ({ currentEvent, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (currentEvent) {
      setForm({
        title: currentEvent.title,
        description: currentEvent.description,
        date: currentEvent.date?.slice(0, 16),
        location: currentEvent.location,
        capacity: currentEvent.capacity
      });
      return;
    }

    setForm(initialState);
  }, [currentEvent]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      capacity: Number(form.capacity)
    });
  };

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="section-heading">
        <h3>{currentEvent ? "Update event" : "Create event"}</h3>
        {currentEvent && (
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>

      <div className="form-grid">
        <label>
          <span>Title</span>
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>
        <label>
          <span>Date</span>
          <input type="datetime-local" name="date" value={form.date} onChange={handleChange} required />
        </label>
        <label>
          <span>Location</span>
          <input name="location" value={form.location} onChange={handleChange} required />
        </label>
        <label>
          <span>Capacity</span>
          <input type="number" min="1" name="capacity" value={form.capacity} onChange={handleChange} required />
        </label>
        <label className="full-span">
          <span>Description</span>
          <textarea name="description" value={form.description} onChange={handleChange} rows="4" required />
        </label>
      </div>

      <button className="primary-button" disabled={loading}>
        {loading ? "Saving..." : currentEvent ? "Save Changes" : "Create Event"}
      </button>
    </form>
  );
};
