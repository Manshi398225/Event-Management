import { useState } from "react";
import useAuth from "../hooks/useAuth";

function ProfilePage() {
  const { user, updateProfile, loading } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError("");
      const payload = {
        name: form.name,
        email: form.email,
      };

      if (form.password) {
        payload.password = form.password;
      }

      const data = await updateProfile(payload);
      setMessage(data.message);
      setForm((current) => ({ ...current, password: "" }));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="page-section">
      <form className="card profile-card" onSubmit={handleSubmit}>
        <h1>My Profile</h1>
        <p>Keep your account details up to date.</p>
        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}
        <label>
          Name
          <input className="input" name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input className="input" name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          New Password
          <input
            className="input"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Leave blank to keep current password"
          />
        </label>
        <button className="button" disabled={loading} type="submit">
          {loading ? "Saving..." : "Update Profile"}
        </button>
      </form>
    </section>
  );
}

export default ProfilePage;
