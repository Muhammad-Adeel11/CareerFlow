import Spinner from './Spinner';

export default function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <Spinner dark />
      <span>{label}</span>
    </div>
  );
}
