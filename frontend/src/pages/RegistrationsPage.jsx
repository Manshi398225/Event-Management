import { useEffect, useState } from "react";
import API_URL, { apiRequest } from "../api/client";
import Loader from "../components/Loader";
import useAuth from "../hooks/useAuth";

function RegistrationsPage() {
  const { token } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadId, setDownloadId] = useState("");
  const [reminderId, setReminderId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchRegistrations = async () => {
    try {
      setMessage("");
      const data = await apiRequest("/register", { token });
      setRegistrations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [token]);

  const handleStatusChange = async (id, status) => {
    try {
      setError("");
      setMessage("");
      await apiRequest(`/register/${id}/status`, {
        method: "PUT",
        token,
        body: { status },
      });
      fetchRegistrations();
    } catch (err) {
      setError(err.message);
    }
  };

  const uniqueEvents = registrations.reduce((events, registration) => {
    const event = registration.eventId;

    if (event?._id && !events.some((entry) => entry._id === event._id)) {
      events.push(event);
    }

    return events;
  }, []);

  const handleDownload = async (eventId, eventTitle) => {
    try {
      setError("");
      setMessage("");
      setDownloadId(eventId);

      const response = await fetch(`${API_URL}/register/export?eventId=${encodeURIComponent(eventId)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to download registrations");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeTitle = (eventTitle || "event-registrations")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      link.href = url;
      link.download = `${safeTitle || "event-registrations"}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloadId("");
    }
  };

  const handleSendReminder = async (eventId) => {
    try {
      setError("");
      setMessage("");
      setReminderId(eventId);
      const data = await apiRequest("/register/reminders/send", {
        method: "POST",
        token,
        body: { eventId },
      });
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setReminderId("");
    }
  };

  if (loading) {
    return <Loader label="Loading registrations..." />;
  }

  return (
    <section className="page-section">
      <div className="section-heading registrations-header">
        <div>
          <h1>Registrations</h1>
          <p>Approve or reject student registrations for each event.</p>
        </div>
        {uniqueEvents.length > 0 && (
          <div className="export-actions">
            {uniqueEvents.map((event) => (
              <button
                className="button secondary"
                key={event._id}
                onClick={() => handleDownload(event._id, event.title)}
                type="button"
              >
                {downloadId === event._id ? "Downloading..." : `Download ${event.title}`}
              </button>
            ))}
          </div>
        )}
      </div>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      <div className="table-card card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Event</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((registration) => (
                <tr key={registration._id}>
                  <td>{registration.userId?.name}</td>
                  <td>{registration.userId?.email}</td>
                  <td>{registration.eventId?.title}</td>
                  <td>{new Date(registration.eventId?.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`pill ${registration.status === "approved" ? "" : "soft"}`}>
                      {registration.status}
                    </span>
                  </td>
                  <td>
                    <div className="inline-actions">
                      <button
                        className="button"
                        onClick={() => handleStatusChange(registration._id, "approved")}
                        type="button"
                      >
                        Approve
                      </button>
                      <button
                        className="button secondary"
                        onClick={() => handleStatusChange(registration._id, "rejected")}
                        type="button"
                      >
                        Reject
                      </button>
                      <button
                        className="button ghost"
                        onClick={() => handleSendReminder(registration.eventId?._id)}
                        type="button"
                      >
                        {reminderId === registration.eventId?._id ? "Sending..." : "Send Reminder"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default RegistrationsPage;
