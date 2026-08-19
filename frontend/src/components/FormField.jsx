export default function FormField({
  label,
  htmlFor,
  error,
  optional,
  hint,
  children,
}) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={htmlFor}>
          {label}
          {optional && <span className="optional">(optional)</span>}
        </label>
      )}
      {children}
      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && (
        <span className="form-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
