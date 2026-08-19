import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IconArrowRight,
  IconBriefcase,
  IconCalendar,
  IconChart,
  IconCheck,
  IconSearch,
  IconShield,
  IconUpload,
} from '../components/icons';
import './Landing.css';

const FEATURES = [
  {
    icon: IconBriefcase,
    title: 'Track every application',
    desc: 'Log company, role, status, salary, and notes in one organized workspace built for job hunting.',
  },
  {
    icon: IconCalendar,
    title: 'Never miss an interview',
    desc: 'Schedule interviews against each application and see upcoming rounds at a glance.',
  },
  {
    icon: IconChart,
    title: 'Visual dashboard',
    desc: 'See your pipeline by status and application volume over time with clean, readable charts.',
  },
  {
    icon: IconSearch,
    title: 'Search & filter instantly',
    desc: 'Find any application by company or role, and filter by status, job type, or date range.',
  },
  {
    icon: IconUpload,
    title: 'Resume on hand',
    desc: 'Keep your latest resume attached to your profile so it is always one click away.',
  },
  {
    icon: IconShield,
    title: 'Private & secure',
    desc: 'Your data is protected with encrypted passwords and token-based authentication.',
  },
];

const STEPS = [
  { title: 'Create your account', desc: 'Sign up in seconds — no credit card, no spam.' },
  { title: 'Add your applications', desc: 'Log roles as you apply, from internships to full-time offers.' },
  { title: 'Track progress to offer', desc: 'Update statuses, schedule interviews, and watch your dashboard fill in.' },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing">
      <section className="hero">
        <div className="container hero-inner">
          <span className="eyebrow">Built for students & job seekers</span>
          <h1 className="hero-title">
            Manage every job &amp; internship application <span className="text-gradient">in one place</span>
          </h1>
          <p className="hero-sub">
            CareerFlow keeps your applications, interviews, and offers organized so you can focus on landing
            the role you want — not chasing spreadsheets.
          </p>
          <div className="hero-actions">
            <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn btn-primary btn-lg">
              {isAuthenticated ? 'Go to dashboard' : 'Get started free'}
              <IconArrowRight width={18} height={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Log in
            </Link>
          </div>
          <ul className="hero-points">
            <li>
              <IconCheck width={16} height={16} /> Free forever
            </li>
            <li>
              <IconCheck width={16} height={16} /> No credit card required
            </li>
            <li>
              <IconCheck width={16} height={16} /> Set up in under a minute
            </li>
          </ul>
        </div>
        <div className="hero-glow" aria-hidden="true" />
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Features</span>
            <h2>Everything you need to run your job search</h2>
            <p>A focused toolkit — nothing you don't need, everything you do.</p>
          </div>
          <div className="feature-grid">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div className="feature-card" key={title}>
                <div className="feature-icon">
                  <Icon width={20} height={20} />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">How it works</span>
            <h2>Three steps to a more organized search</h2>
          </div>
          <div className="steps-grid">
            {STEPS.map((step, i) => (
              <div className="step-card" key={step.title}>
                <div className="step-number">{i + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-banner">
            <div>
              <h2>Ready to take control of your job search?</h2>
              <p>Join CareerFlow and start tracking your applications today — it's free.</p>
            </div>
            <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn btn-primary btn-lg">
              {isAuthenticated ? 'Go to dashboard' : 'Create free account'}
              <IconArrowRight width={18} height={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
