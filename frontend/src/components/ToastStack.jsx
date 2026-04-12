function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) {
    return null;
  }

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <button
          className={`toast toast-${toast.type || "info"}`}
          key={toast.id}
          onClick={() => onDismiss(toast.id)}
          type="button"
        >
          <strong>{toast.title}</strong>
          {toast.message && <span>{toast.message}</span>}
        </button>
      ))}
    </div>
  );
}

export default ToastStack;
