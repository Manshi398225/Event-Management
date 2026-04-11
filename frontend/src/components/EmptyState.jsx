function EmptyState({ title, message }) {
  return (
    <div className="card empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;
