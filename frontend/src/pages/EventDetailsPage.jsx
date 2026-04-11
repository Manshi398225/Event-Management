import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import Loader from "../components/Loader";
import useAuth from "../hooks/useAuth";

function EventDetailsPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/events/${id}`);
      setEvent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    try {
      setMessage("");
      setError("");
      const data = await apiRequest(`/register/${id}`, {
        method: "POST",
        token,
      });
      setMessage(data.message);
      fetchEvent();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <Loader label="Loading event details..." />;
  }

  if (!event) {
    return <div className="alert error">{error || "Event not found"}</div>;
  }

  return (
    <section className="page-section">
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      <article className="card detail-card">
        <span className="pill">Event Details</span>
        <h1>{event.title}</h1>
        <p>{event.description}</p>
        <div className="detail-grid">
          <div className="detail-box">
            <strong>Category</strong>
            <span>{event.category}</span>
          </div>
          <div className="detail-box">
            <strong>Date</strong>
            <span>{new Date(event.date).toLocaleString()}</span>
          </div>
          <div className="detail-box">
            <strong>Location</strong>
            <span>{event.location}</span>
          </div>
          <div className="detail-box">
            <strong>Status</strong>
            <span>{event.status}</span>
          </div>
          <div className="detail-box">
            <strong>Seats Available</strong>
            <span>{event.availableSeats}</span>
          </div>
        </div>
        {user?.role === "student" && (
          <button className="button" disabled={event.status === "Full"} onClick={handleRegister} type="button">
            {event.status === "Full" ? "Event Full" : "Register for Event"}
          </button>
        )}
        {event.reviews?.length > 0 && (
          <div className="reviews-block">
            <h2>Student Feedback</h2>
            <div className="grid cards-grid">
              {event.reviews.map((review) => (
                <article className="card" key={review._id}>
                  <strong>{review.userId?.name || "Student"}</strong>
                  <span className="pill">{`${review.feedbackRating}/5`}</span>
                  <p>{review.feedbackComment || "No comment provided."}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </article>
    </section>
  );
}

export default EventDetailsPage;
