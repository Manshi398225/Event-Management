function StatCard({ label, value }) {
  return (
    <div className="card stat-card">
      <p>{label}</p>
      <h3>{value}</h3>
    </div>
  );
}

export default StatCard;
