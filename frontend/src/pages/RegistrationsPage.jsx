import { useEffect, useMemo, useState } from "react";
import API_URL, { apiRequest } from "../api/client";
import Loader from "../components/Loader";
import ToastStack from "../components/ToastStack";
import useAuth from "../hooks/useAuth";

const createToast = (title, message, type = "info") => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  title,
  message,
  type,
});

function RegistrationsPage() {
  const { token } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadId, setDownloadId] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [reminderId, setReminderId] = useState("");
  const [statusAction, setStatusAction] = useState({ id: "", value: "" });
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

  const fetchRegistrations = async () => {
    try {
      setMessage("");
      const data = await apiRequest("/register", { token });
      setRegistrations(data);
      setSelectedEventId((current) => {
        if (current && data.some((item) => item.eventId?._id === current)) {
          return current;
        }

        return data[0]?.eventId?._id || "";
      });
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
      setStatusAction({ id, value: status });
      const data = await apiRequest(`/register/${id}/status`, {
        method: "PUT",
        token,
        body: { status },
      });
      setRegistrations((current) =>
        current.map((registration) =>
          registration._id === id
            ? {
                ...registration,
                status,
              }
            : registration
        )
      );
      setMessage(data.message);
      pushToast(
        status === "approved" ? "Registration approved" : "Registration updated",
        data.registration?.userId?.name
          ? `${data.registration.userId.name} is now marked as ${status}.`
          : `The registration is now marked as ${status}.`,
        status === "approved" ? "success" : "info"
      );
    } catch (err) {
      setError(err.message);
      pushToast("Action failed", err.message, "error");
    } finally {
      setStatusAction({ id: "", value: "" });
    }
  };

  const uniqueEvents = useMemo(
    () =>
      registrations.reduce((events, registration) => {
        const event = registration.eventId;

        if (event?._id && !events.some((entry) => entry._id === event._id)) {
          events.push(event);
        }

        return events;
      }, []),
    [registrations]
  );

  const selectedEvent = uniqueEvents.find((event) => event._id === selectedEventId) || null;
  const registrationsForSelectedEvent = selectedEvent
    ? registrations.filter((registration) => registration.eventId?._id === selectedEvent._id)
    : [];

  const handleDownload = async ({ eventId = "", type, eventTitle = "" }) => {
    try {
      setError("");
      setMessage("");
      const downloadKey = type === "all" ? "all" : `${type}-${eventId || "all"}`;
      setDownloadId(downloadKey);

      const searchParams = new URLSearchParams({ type });
      if (eventId) {
        searchParams.set("eventId", eventId);
      }

      const response = await fetch(`${API_URL}/register/export?${searchParams.toString()}`, {
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
      const safeTitle = (eventTitle || (type === "participants" ? "participant-list" : "all-registrations"))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      link.href = url;
      link.download =
        type === "all" ? `${safeTitle || "all-registrations"}.csv` : `${safeTitle || "participant-list"}-${type}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      pushToast("Download started", `${type === "participants" ? "Participant list" : "Registration export"} is ready.`, "success");
    } catch (err) {
      setError(err.message);
      pushToast("Download failed", err.message, "error");
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
      pushToast("Reminder emails queued", data.message, "success");
    } catch (err) {
      setError(err.message);
      pushToast("Reminder failed", err.message, "error");
    } finally {
      setReminderId("");
    }
  };

  if (loading) {
    return <Loader label="Loading registrations..." />;
  }

  return (
    <section className="page-section">
      <ToastStack onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} toasts={toasts} />
      <div className="section-heading registrations-header">
        <div>
          <h1>Registrations</h1>
          <p>Approve registrations faster, send reminder emails, and download cleaner participant files.</p>
        </div>
      </div>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      {uniqueEvents.length > 0 && (
        <div className="grid registrations-tools-grid">
          <article className="card admin-action-card">
            <div>
              <span className="pill">Downloads</span>
              <h3>Registration files</h3>
              <p>Download either the complete registration export or a cleaner participant list for one event.</p>
            </div>
            <label>
              Event
              <select
                className="input"
                onChange={(event) => setSelectedEventId(event.target.value)}
                value={selectedEventId}
              >
                {uniqueEvents.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="inline-actions">
              <button
                className="button secondary"
                onClick={() => handleDownload({ type: "all", eventTitle: "all-registrations" })}
                type="button"
              >
                {downloadId === "all" ? "Downloading..." : "Download All Registrations"}
              </button>
              <button
                className="button"
                disabled={!selectedEvent}
                onClick={() =>
                  handleDownload({
                    eventId: selectedEvent?._id,
                    eventTitle: selectedEvent?.title,
                    type: "participants",
                  })
                }
                type="button"
              >
                {downloadId === `participants-${selectedEvent?._id || ""}` ? "Downloading..." : "Download Participant List"}
              </button>
            </div>
          </article>

          <article className="card admin-action-card">
            <div>
              <span className="pill">Notifications</span>
              <h3>Reminder email popup</h3>
              <p>Pick an event, then click send reminder. A popup notification appears as soon as the emails are queued.</p>
            </div>
            {selectedEvent && (
              <div className="notification-preview">
                <strong>{selectedEvent.title}</strong>
                <span>{new Date(selectedEvent.date).toLocaleString()}</span>
                <span>{selectedEvent.location}</span>
                <span>{registrationsForSelectedEvent.length} registration(s)</span>
              </div>
            )}
            <button
              className="button"
              disabled={!selectedEvent || reminderId === selectedEvent?._id}
              onClick={() => handleSendReminder(selectedEvent._id)}
              type="button"
            >
              {reminderId === selectedEvent?._id ? "Sending reminder..." : "Send Reminder Email"}
            </button>
          </article>
        </div>
      )}
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
                        disabled={statusAction.id === registration._id}
                        onClick={() => handleStatusChange(registration._id, "approved")}
                        type="button"
                      >
                        {statusAction.id === registration._id && statusAction.value === "approved" ? "Approving..." : "Approve"}
                      </button>
                      <button
                        className="button secondary"
                        disabled={statusAction.id === registration._id}
                        onClick={() => handleStatusChange(registration._id, "rejected")}
                        type="button"
                      >
                        {statusAction.id === registration._id && statusAction.value === "rejected" ? "Rejecting..." : "Reject"}
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
