import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError("");
      const data = await login(form);
      const redirect =
        data.user.role === "admin" ? "/admin/dashboard" : location.state?.from?.pathname || "/";
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="auth-shell">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <p>Log in to manage your events and registrations.</p>
        {error && <div className="alert error">{error}</div>}
        <label>
          Email
          <input className="input" name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input
            className="input"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>
        <button className="button" disabled={loading} type="submit">
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="muted-text">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </section>
  );
}

export default LoginPage;
