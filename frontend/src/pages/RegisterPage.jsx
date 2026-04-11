import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError("");
      const data = await register(form);
      navigate(data.user.role === "admin" ? "/admin/dashboard" : "/", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="auth-shell">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Create account</h1>
        <p>Get started with your campus event workspace.</p>
        {error && <div className="alert error">{error}</div>}
        <label>
          Full Name
          <input className="input" name="name" value={form.name} onChange={handleChange} required />
        </label>
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
        <label>
          Role
          <select className="input" name="role" value={form.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <button className="button" disabled={loading} type="submit">
          {loading ? "Creating account..." : "Register"}
        </button>
        <p className="muted-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </section>
  );
}

export default RegisterPage;
