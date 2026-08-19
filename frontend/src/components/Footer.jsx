import { Link } from 'react-router-dom';
import { IconBriefcase } from './icons';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="brand-mark small">
            <IconBriefcase width={16} height={16} />
          </span>
          <span>CareerFlow</span>
        </div>
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} CareerFlow. Built for students and job seekers everywhere.
        </p>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/login">Log in</Link>
          <Link to="/register">Sign up</Link>
        </div>
      </div>
    </footer>
  );
}
