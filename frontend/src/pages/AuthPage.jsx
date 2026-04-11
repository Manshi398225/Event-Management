import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setAuthToken } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export const AuthPage = ({ mode }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : form;
      const { data } = await api.post(endpoint, payload);
      login(data);
      setAuthToken(data.token);
      navigate(data.user.role === "admin" ? "/admin" : "/");
    } catch (error) {
      setMessage(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <span className="eyebrow">{mode === "login" ? "Welcome Back" : "Create Account"}</span>
        <h1>{mode === "login" ? "Sign in to EMS" : "Register for college events"}</h1>
        <p>
          Access the event platform for announcements, registrations, approvals, and profile
          management.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <label>
                <span>Full Name</span>
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>
              <label>
                <span>Role</span>
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </>
          )}

          <label>
            <span>Email</span>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          {message && <div className="info-banner error">{message}</div>}

          <button className="primary-button" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        <p className="switch-link">
          {mode === "login" ? "Need an account?" : "Already registered?"}{" "}
          <Link to={mode === "login" ? "/register" : "/login"}>
            {mode === "login" ? "Register here" : "Login here"}
          </Link>
        </p>
      </div>
    </section>
  );
};
