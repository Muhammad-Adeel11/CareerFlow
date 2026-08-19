import { Link } from 'react-router-dom';
import { IconArrowRight } from '../components/icons';

export default function NotFound() {
  return (
    <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: 12 }}>404</h1>
      <p style={{ color: 'var(--color-slate-500)', marginBottom: 24 }}>
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="btn btn-primary">
        Back to home
        <IconArrowRight width={18} height={18} />
      </Link>
    </div>
  );
}
