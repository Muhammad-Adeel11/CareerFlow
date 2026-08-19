import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { validateLoginForm } from '../utils/validators';
import FormField from '../components/FormField';
import Spinner from '../components/Spinner';
import { IconBriefcase, IconAlert } from '../components/icons';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((err) => ({ ...err, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const validationErrors = validateLoginForm(values);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(getErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-in">
        <div className="auth-header">
          <span className="brand-mark" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconBriefcase width={20} height={20} />
          </span>
          <h1>Welcome back</h1>
          <p>Log in to keep tracking your applications</p>
        </div>

        {formError && (
          <div className="form-banner form-banner-error" role="alert">
            <IconAlert width={18} height={18} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <FormField label="Email" htmlFor="email" error={errors.email}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className={`form-input${errors.email ? ' has-error' : ''}`}
              placeholder="you@example.com"
              value={values.email}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="Password" htmlFor="password" error={errors.password}>
            <div className="password-field-wrap">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`form-input${errors.password ? ' has-error' : ''}`}
                placeholder="Enter your password"
                value={values.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </FormField>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading && <Spinner size={18} />}
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="auth-footer-link">
          Don't have an account? <Link to="/register">Create one free</Link>
        </p>
      </div>
    </div>
  );
}
