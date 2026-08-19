import { useEffect, useState } from 'react';
import { validateInterviewForm } from '../utils/validators';
import { getErrorMessage } from '../services/api';
import FormField from './FormField';
import Spinner from './Spinner';
import { IconX, IconAlert } from './icons';

const INTERVIEW_TYPES = ['Phone', 'Video', 'Technical', 'HR', 'On-site', 'Other'];
const INTERVIEW_STATUSES = ['Scheduled', 'Completed', 'Cancelled'];

function toLocalInputDateTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function InterviewFormModal({ open, applicationId, initialData, onClose, onSubmit }) {
  const emptyForm = {
    applicationId,
    interviewDate: '',
    interviewType: 'Video',
    interviewer: '',
    locationOrLink: '',
    status: 'Scheduled',
    notes: '',
  };

  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (open) {
      setValues(
        initialData
          ? { ...emptyForm, ...initialData, interviewDate: toLocalInputDateTime(initialData.interviewDate) }
          : { ...emptyForm, applicationId }
      );
      setErrors({});
      setFormError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData, applicationId]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((err) => ({ ...err, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const validationErrors = validateInterviewForm(values);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not save this interview.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 className="modal-title" style={{ marginBottom: 0 }}>
            {initialData ? 'Edit interview' : 'Add interview'}
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
          <FormField label="Interview date & time" htmlFor="interviewDate" error={errors.interviewDate}>
            <input
              id="interviewDate"
              name="interviewDate"
              type="datetime-local"
              className={`form-input${errors.interviewDate ? ' has-error' : ''}`}
              value={values.interviewDate}
              onChange={handleChange}
            />
          </FormField>

          <div className="form-row">
            <FormField label="Type" htmlFor="interviewType" error={errors.interviewType}>
              <select
                id="interviewType"
                name="interviewType"
                className="form-select"
                value={values.interviewType}
                onChange={handleChange}
              >
                {INTERVIEW_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Status" htmlFor="status">
              <select id="status" name="status" className="form-select" value={values.status} onChange={handleChange}>
                {INTERVIEW_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Interviewer" htmlFor="interviewer" optional>
            <input
              id="interviewer"
              name="interviewer"
              className="form-input"
              value={values.interviewer}
              onChange={handleChange}
              placeholder="e.g. Alex, Engineering Manager"
            />
          </FormField>

          <FormField label="Location or link" htmlFor="locationOrLink" optional>
            <input
              id="locationOrLink"
              name="locationOrLink"
              className="form-input"
              value={values.locationOrLink}
              onChange={handleChange}
              placeholder="e.g. Google Meet link or office address"
            />
          </FormField>

          <FormField label="Notes" htmlFor="notes" optional>
            <textarea
              id="notes"
              name="notes"
              className="form-textarea"
              value={values.notes}
              onChange={handleChange}
              placeholder="What to prepare, topics covered…"
            />
          </FormField>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <Spinner size={16} />}
              {initialData ? 'Save changes' : 'Add interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
