import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import useAuth from "../hooks/useAuth";

function FeedbackCard({ entry, onSubmit, submitting }) {
  const [rating, setRating] = useState(entry.feedbackRating || 5);
  const [comment, setComment] = useState(entry.feedbackComment || "");

  return (
    <div className="feedback-card">
      <h4>Feedback</h4>
      <label>
        Rating
        <select className="input" value={rating} onChange={(event) => setRating(Number(event.target.value))}>
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} Star{value > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </label>
      <label>
        Comments
        <textarea
          className="input textarea"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Share what went well and what could improve"
        />
      </label>
      <button className="button" disabled={submitting} onClick={() => onSubmit(entry._id, rating, comment)} type="button">
        {submitting ? "Saving..." : entry.feedbackSubmittedAt ? "Update Feedback" : "Submit Feedback"}
      </button>
    </div>
  );
}

function MyEventsPage() {
  const { token } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState("");
  const [removingId, setRemovingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const data = await apiRequest("/my-events", { token });
        setEntries(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, [token]);

  const submitFeedback = async (id, rating, comment) => {
    try {
      setError("");
      setSubmittingId(id);
      await apiRequest(`/register/${id}/feedback`, {
        method: "PUT",
        token,
        body: { rating, comment },
      });

      setEntries((current) =>
        current.map((entry) =>
          entry._id === id
            ? {
                ...entry,
                feedbackRating: rating,
                feedbackComment: comment,
                feedbackSubmittedAt: new Date().toISOString(),
              }
            : entry
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingId("");
    }
  };

  const removeEvent = async (id) => {
    try {
      setError("");
      setRemovingId(id);
      await apiRequest(`/register/my-events/${id}`, {
        method: "DELETE",
        token,
      });
      setEntries((current) => current.filter((entry) => entry._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setRemovingId("");
    }
  };

  if (loading) {
    return <Loader label="Loading your registrations..." />;
  }

  if (entries.length === 0) {
    return <EmptyState title="No registrations yet" message="Register for an event to see it here." />;
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <h1>My Events</h1>
        <p>Track all your registered campus events, ticket QR codes, and feedback.</p>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="grid cards-grid">
        {entries.map((entry) => (
          <article className="card" key={entry._id}>
            <span className={`pill ${entry.status === "approved" ? "" : "soft"}`}>{entry.status}</span>
            <h3>{entry.event?.title}</h3>
            <p>{entry.event?.description}</p>
            <div className="event-meta">
              <span>{new Date(entry.event?.date).toLocaleString()}</span>
              <span>{entry.event?.location}</span>
              <span>{entry.event?.category}</span>
              {entry.ticketCode && <span>Ticket: {entry.ticketCode}</span>}
            </div>
            {entry.qrCodeDataUrl && (
              <img alt={`QR ticket for ${entry.event?.title}`} className="ticket-qr" src={entry.qrCodeDataUrl} />
            )}
            <button
              className="button secondary"
              disabled={removingId === entry._id}
              onClick={() => removeEvent(entry._id)}
              type="button"
            >
              {removingId === entry._id ? "Removing..." : "Remove Event"}
            </button>
            {new Date(entry.event?.date) <= new Date() && (
              <FeedbackCard
                entry={entry}
                onSubmit={submitFeedback}
                submitting={submittingId === entry._id}
              />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default MyEventsPage;
