function Toast({ toast, onClose }) {
  if (!toast) {
    return null;
  }

  return (
    <div className={`toast toast-${toast.type}`} role="status" aria-live="polite">
      <div>
        <strong>{toast.title}</strong>
        <p>{toast.message}</p>
      </div>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Close notification">
        x
      </button>
    </div>
  );
}

export default Toast;
