import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import Loader from "../components/Loader";
import ToastStack from "../components/ToastStack";
import useAuth from "../hooks/useAuth";

const createToast = (title, message, type = "info") => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  title,
  message,
  type,
});

function EventDetailsPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
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
      setRegistering(true);
      const data = await apiRequest(`/register/${id}`, {
        method: "POST",
        token,
      });
      setMessage(data.message);
      pushToast("Registration submitted", data.message, "success");
      fetchEvent();
    } catch (err) {
      setError(err.message);
      pushToast("Unable to register", err.message, "error");
    } finally {
      setRegistering(false);
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
      <ToastStack onDismiss={(toastId) => setToasts((current) => current.filter((toast) => toast.id !== toastId))} toasts={toasts} />
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
          <button
            className="button"
            disabled={event.status === "Full" || registering}
            onClick={handleRegister}
            type="button"
          >
            {registering ? "Registering..." : event.status === "Full" ? "Event Full" : "Register for Event"}
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
