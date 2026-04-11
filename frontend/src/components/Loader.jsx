function Loader({ label = "Loading..." }) {
  return (
    <div className="loader-wrap">
      <div className="loader" />
      <p>{label}</p>
    </div>
  );
}

export default Loader;
