import { Link } from "react-router-dom";

function EventCard({ event, action }) {
  return (
    <article className="card event-card">
      <div className="event-card-top">
        <span className="pill">{event.category || "Campus Event"}</span>
        <span className={`pill ${event.status === "Full" ? "soft" : ""}`}>
          {event.status || "Open"}
        </span>
      </div>
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <div className="event-meta">
        <span>{new Date(event.date).toLocaleString()}</span>
        <span>{event.location}</span>
        <span>{event.capacity} capacity</span>
        <span>{event.availableSeats} seats left</span>
      </div>
      <div className="event-actions">
        <Link className="button ghost" to={`/events/${event._id}`}>
          View Details
        </Link>
        {action}
      </div>
    </article>
  );
}

export default EventCard;
