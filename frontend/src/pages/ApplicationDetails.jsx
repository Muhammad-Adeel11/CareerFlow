import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  getApplication,
  deleteApplication,
  updateApplication,
} from '../services/applicationService';
import { createInterview, updateInterview, deleteInterview } from '../services/interviewService';
import { getErrorMessage } from '../services/api';
import { formatDate, formatDateTime } from '../utils/validators';
import Badge from '../components/Badge';
import PageLoader from '../components/PageLoader';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import ApplicationFormModal from '../components/ApplicationFormModal';
import InterviewFormModal from '../components/InterviewFormModal';
import {
  IconArrowRight,
  IconCalendar,
  IconDollar,
  IconEdit,
  IconLink,
  IconMapPin,
  IconPlus,
  IconTrash,
} from '../components/icons';
import './ApplicationDetails.css';

export default function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editAppOpen, setEditAppOpen] = useState(false);
  const [deleteAppOpen, setDeleteAppOpen] = useState(false);
  const [deletingApp, setDeletingApp] = useState(false);

  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [deleteInterviewTarget, setDeleteInterviewTarget] = useState(null);
  const [deletingInterview, setDeletingInterview] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getApplication(id);
      setApplication(res.data.application);
      setInterviews(res.data.interviews);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load this application.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateApplication = async (values) => {
    const res = await updateApplication(id, values);
    setApplication(res.data.application);
    setEditAppOpen(false);
  };

  const handleDeleteApplication = async () => {
    setDeletingApp(true);
    try {
      await deleteApplication(id);
      navigate('/applications');
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to delete this application.'));
      setDeletingApp(false);
    }
  };

  const handleCreateInterview = async (values) => {
    await createInterview(values);
    setInterviewModalOpen(false);
    fetchData();
  };

  const handleUpdateInterview = async (values) => {
    await updateInterview(editingInterview._id, values);
    setInterviewModalOpen(false);
    setEditingInterview(null);
    fetchData();
  };

  const handleDeleteInterview = async () => {
    setDeletingInterview(true);
    try {
      await deleteInterview(deleteInterviewTarget._id);
      setDeleteInterviewTarget(null);
      fetchData();
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to delete this interview.'));
    } finally {
      setDeletingInterview(false);
    }
  };

  if (loading) return <PageLoader label="Loading application…" />;

  if (error && !application) {
    return (
      <div className="container" style={{ padding: '60px 0' }}>
        <div className="form-banner form-banner-error">{error}</div>
        <Link to="/applications" className="btn btn-secondary" style={{ marginTop: 16 }}>
          Back to applications
        </Link>
      </div>
    );
  }

  return (
    <div className="container details-page">
      <Link to="/applications" className="back-link">
        &larr; Back to applications
      </Link>

      {error && <div className="form-banner form-banner-error">{error}</div>}

      <div className="details-header">
        <div>
          <div className="details-title-row">
            <h1>{application.position}</h1>
            <Badge value={application.status} />
          </div>
          <p className="details-company">{application.company}</p>
        </div>
        <div className="details-header-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setEditAppOpen(true)}>
            <IconEdit width={16} height={16} />
            Edit
          </button>
          <button type="button" className="btn btn-danger" onClick={() => setDeleteAppOpen(true)}>
            <IconTrash width={16} height={16} />
            Delete
          </button>
        </div>
      </div>

      <div className="details-grid">
        <div className="card card-padded details-main">
          <div className="details-meta-grid">
            <div className="meta-item">
              <IconMapPin width={16} height={16} />
              <div>
                <div className="meta-label">Location</div>
                <div className="meta-value">{application.location || '—'}</div>
              </div>
            </div>
            <div className="meta-item">
              <IconCalendar width={16} height={16} />
              <div>
                <div className="meta-label">Applied on</div>
                <div className="meta-value">{formatDate(application.applicationDate)}</div>
              </div>
            </div>
            <div className="meta-item">
              <IconDollar width={16} height={16} />
              <div>
                <div className="meta-label">Salary</div>
                <div className="meta-value">{application.salary || '—'}</div>
              </div>
            </div>
            <div className="meta-item">
              <IconArrowRight width={16} height={16} />
              <div>
                <div className="meta-label">Job type</div>
                <div className="meta-value">{application.jobType}</div>
              </div>
            </div>
          </div>

          {application.jobUrl && (
            <a href={application.jobUrl} target="_blank" rel="noopener noreferrer" className="job-url-link">
              <IconLink width={15} height={15} />
              {application.jobUrl}
            </a>
          )}

          {application.description && (
            <>
              <hr className="divider" />
              <h3 className="details-section-title">Description</h3>
              <p className="details-text">{application.description}</p>
            </>
          )}

          {application.notes && (
            <>
              <hr className="divider" />
              <h3 className="details-section-title">Notes</h3>
              <p className="details-text">{application.notes}</p>
            </>
          )}
        </div>

        <div className="card card-padded details-side">
          <div className="details-side-header">
            <h3 className="details-section-title" style={{ marginBottom: 0 }}>
              Interviews
            </h3>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingInterview(null);
                setInterviewModalOpen(true);
              }}
            >
              <IconPlus width={15} height={15} />
              Add
            </button>
          </div>

          {interviews.length === 0 ? (
            <EmptyState
              icon={<IconCalendar width={22} height={22} />}
              title="No interviews yet"
              message="Add an interview to keep track of upcoming rounds."
            />
          ) : (
            <ul className="interview-list">
              {interviews.map((interview) => (
                <li key={interview._id} className="interview-item">
                  <div className="interview-item-top">
                    <Badge value={interview.status} />
                    <span className="interview-type">{interview.interviewType}</span>
                  </div>
                  <div className="interview-date">{formatDateTime(interview.interviewDate)}</div>
                  {interview.interviewer && <div className="interview-detail">With {interview.interviewer}</div>}
                  {interview.locationOrLink && (
                    <div className="interview-detail interview-link">{interview.locationOrLink}</div>
                  )}
                  {interview.notes && <div className="interview-notes">{interview.notes}</div>}
                  <div className="interview-item-actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setEditingInterview(interview);
                        setInterviewModalOpen(true);
                      }}
                    >
                      <IconEdit width={14} height={14} />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setDeleteInterviewTarget(interview)}
                    >
                      <IconTrash width={14} height={14} />
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ApplicationFormModal
        open={editAppOpen}
        initialData={application}
        onClose={() => setEditAppOpen(false)}
        onSubmit={handleUpdateApplication}
      />

      <ConfirmModal
        open={deleteAppOpen}
        title="Delete this application?"
        message="This will permanently remove this application and all its interviews."
        confirmLabel="Delete"
        loading={deletingApp}
        onConfirm={handleDeleteApplication}
        onCancel={() => setDeleteAppOpen(false)}
      />

      <InterviewFormModal
        open={interviewModalOpen}
        applicationId={id}
        initialData={editingInterview}
        onClose={() => {
          setInterviewModalOpen(false);
          setEditingInterview(null);
        }}
        onSubmit={editingInterview ? handleUpdateInterview : handleCreateInterview}
      />

      <ConfirmModal
        open={!!deleteInterviewTarget}
        title="Delete this interview?"
        message="This interview will be permanently removed."
        confirmLabel="Delete"
        loading={deletingInterview}
        onConfirm={handleDeleteInterview}
        onCancel={() => setDeleteInterviewTarget(null)}
      />
    </div>
  );
}
