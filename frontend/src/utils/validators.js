export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isValidUrl = (value) => {
  if (!value) return true;
  return /^https?:\/\/.+/i.test(value);
};

export function validateLoginForm(values) {
  const errors = {};
  if (!values.email?.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(values.email)) errors.email = 'Enter a valid email address';

  if (!values.password) errors.password = 'Password is required';

  return errors;
}

export function validateRegisterForm(values) {
  const errors = {};
  if (!values.name?.trim()) errors.name = 'Full name is required';
  else if (values.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

  if (!values.email?.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(values.email)) errors.email = 'Enter a valid email address';

  if (!values.password) errors.password = 'Password is required';
  else if (values.password.length < 8) errors.password = 'Password must be at least 8 characters';

  if (!values.confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match';

  return errors;
}

export function validateApplicationForm(values) {
  const errors = {};
  if (!values.company?.trim()) errors.company = 'Company is required';
  if (!values.position?.trim()) errors.position = 'Position is required';
  if (!values.applicationDate) errors.applicationDate = 'Application date is required';
  if (!values.status) errors.status = 'Status is required';
  if (values.jobUrl && !isValidUrl(values.jobUrl)) errors.jobUrl = 'Enter a valid URL starting with http(s)://';

  return errors;
}

export function validateInterviewForm(values) {
  const errors = {};
  if (!values.applicationId) errors.applicationId = 'Please select the related application';
  if (!values.interviewDate) errors.interviewDate = 'Interview date is required';
  if (!values.interviewType) errors.interviewType = 'Interview type is required';

  return errors;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function toInputDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}
