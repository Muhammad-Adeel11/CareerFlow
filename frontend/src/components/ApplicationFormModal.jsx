import { useEffect, useState } from 'react';
import { validateApplicationForm, toInputDate } from '../utils/validators';
import { getErrorMessage } from '../services/api';
import FormField from './FormField';
import Spinner from './Spinner';
import { IconX, IconAlert } from './icons';

const JOB_TYPES = ['Remote', 'On-site', 'Hybrid', 'Full-time', 'Part-time', 'Internship', 'Contract'];
const STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

const emptyForm = {
  company: '',
  position: '',
  location: '',
  jobType: 'Full-time',
  status: 'Applied',
  applicationDate: toInputDate(new Date().toISOString()),
  salary: '',
  jobUrl: '',
  description: '',
  notes: '',
};

export default function ApplicationFormModal({ open, initialData, onClose, onSubmit }) {
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (open) {
      setValues(
        initialData
          ? { ...emptyForm, ...initialData, applicationDate: toInputDate(initialData.applicationDate) }
          : emptyForm
      );
      setErrors({});
      setFormError('');
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((err) => ({ ...err, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const validationErrors = validateApplicationForm(values);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not save this application.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: 640, maxHeight: '88vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 className="modal-title" style={{ marginBottom: 0 }}>
            {initialData ? 'Edit application' : 'Add application'}
          </h3>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <IconX width={18} height={18} />
          </button>
        </div>

        {formError && (
          <div className="form-banner form-banner-error" role="alert">
            <IconAlert width={18} height={18} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <FormField label="Company" htmlFor="company" error={errors.company}>
              <input
                id="company"
                name="company"
                className={`form-input${errors.company ? ' has-error' : ''}`}
                value={values.company}
                onChange={handleChange}
                placeholder="e.g. Stripe"
              />
            </FormField>
            <FormField label="Position" htmlFor="position" error={errors.position}>
              <input
                id="position"
                name="position"
                className={`form-input${errors.position ? ' has-error' : ''}`}
                value={values.position}
                onChange={handleChange}
                placeholder="e.g. Frontend Engineer Intern"
              />
            </FormField>
          </div>

          <div className="form-row">
            <FormField label="Location" htmlFor="location" optional>
              <input
                id="location"
                name="location"
                className="form-input"
                value={values.location}
                onChange={handleChange}
                placeholder="e.g. Remote"
              />
            </FormField>
            <FormField label="Job type" htmlFor="jobType">
              <select id="jobType" name="jobType" className="form-select" value={values.jobType} onChange={handleChange}>
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="form-row">
            <FormField label="Status" htmlFor="status" error={errors.status}>
              <select id="status" name="status" className="form-select" value={values.status} onChange={handleChange}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Application date" htmlFor="applicationDate" error={errors.applicationDate}>
              <input
                id="applicationDate"
                name="applicationDate"
                type="date"
                className={`form-input${errors.applicationDate ? ' has-error' : ''}`}
                value={values.applicationDate}
                onChange={handleChange}
              />
            </FormField>
          </div>

          <div className="form-row">
            <FormField label="Salary" htmlFor="salary" optional>
              <input
                id="salary"
                name="salary"
                className="form-input"
                value={values.salary}
                onChange={handleChange}
                placeholder="e.g. $30/hr"
              />
            </FormField>
            <FormField label="Job URL" htmlFor="jobUrl" optional error={errors.jobUrl}>
              <input
                id="jobUrl"
                name="jobUrl"
                className={`form-input${errors.jobUrl ? ' has-error' : ''}`}
                value={values.jobUrl}
                onChange={handleChange}
                placeholder="https://…"
              />
            </FormField>
          </div>

          <FormField label="Description" htmlFor="description" optional>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              value={values.description}
              onChange={handleChange}
              placeholder="Role summary, responsibilities…"
            />
          </FormField>

          <FormField label="Notes" htmlFor="notes" optional>
            <textarea
              id="notes"
              name="notes"
              className="form-textarea"
              value={values.notes}
              onChange={handleChange}
              placeholder="Referrals, follow-ups, contacts…"
            />
          </FormField>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <Spinner size={16} />}
              {initialData ? 'Save changes' : 'Add application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
