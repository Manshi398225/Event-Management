import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [monthOffset, setMonthOffset] = useState(0);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await apiRequest("/events");
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const monthDate = useMemo(() => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + monthOffset);
    return date;
  }, [monthOffset]);

  const monthLabel = monthDate.toLocaleString(undefined, { month: "long", year: "numeric" });
  const firstDayIndex = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

  const eventsByDate = useMemo(() => {
    return events.reduce((map, event) => {
      const key = new Date(event.date).toISOString().slice(0, 10);
      map[key] = map[key] || [];
      map[key].push(event);
      return map;
    }, {});
  }, [events]);

  const cells = [];
  for (let index = 0; index < firstDayIndex; index += 1) {
    cells.push(<div className="calendar-cell muted" key={`empty-${index}`} />);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const cellDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    const key = cellDate.toISOString().slice(0, 10);
    const dayEvents = eventsByDate[key] || [];

    cells.push(
      <div className="calendar-cell" key={key}>
        <div className="calendar-date">{day}</div>
        <div className="calendar-events">
          {dayEvents.map((event) => (
            <Link className="calendar-event" key={event._id} to={`/events/${event._id}`}>
              <strong>{event.title}</strong>
              <span>{event.location}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loader label="Loading calendar..." />;
  }

  if (!events.length) {
    return <EmptyState title="No events yet" message="Add some events to populate the calendar." />;
  }

  return (
    <section className="page-section">
      <div className="section-heading calendar-header">
        <div>
          <h1>Event Calendar</h1>
          <p>See upcoming campus events in a month view.</p>
        </div>
        <div className="inline-actions">
          <button className="button secondary" onClick={() => setMonthOffset((value) => value - 1)} type="button">
            Previous
          </button>
          <span className="calendar-label">{monthLabel}</span>
          <button className="button secondary" onClick={() => setMonthOffset((value) => value + 1)} type="button">
            Next
          </button>
        </div>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div className="calendar-weekday" key={day}>
            {day}
          </div>
        ))}
        {cells}
      </div>
    </section>
  );
}

export default CalendarPage;
