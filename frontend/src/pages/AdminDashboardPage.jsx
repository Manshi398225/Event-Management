import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import Loader from "../components/Loader";
import StatCard from "../components/StatCard";
import useAuth from "../hooks/useAuth";

function AdminDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiRequest("/dashboard/admin/stats", { token });
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return <Loader label="Loading dashboard..." />;
  }

  if (error) {
    return <div className="alert error">{error}</div>;
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <h1>Admin Dashboard</h1>
        <p>Review growth, events, and registrations at a glance.</p>
      </div>
      <div className="grid stats-grid">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Total Events" value={stats.totalEvents} />
        <StatCard label="Registrations" value={stats.totalRegistrations} />
        <StatCard label="Approved" value={stats.approvedRegistrations} />
        <StatCard label="Pending" value={stats.pendingRegistrations} />
        <StatCard label="Avg Rating" value={stats.averageRating || "0.0"} />
      </div>
    </section>
  );
}

export default AdminDashboardPage;
