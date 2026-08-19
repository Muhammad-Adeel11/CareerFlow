import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from '../services/applicationService';
import { getErrorMessage } from '../services/api';
import { formatDate } from '../utils/validators';
import Badge from '../components/Badge';
import PageLoader from '../components/PageLoader';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import ApplicationFormModal from '../components/ApplicationFormModal';
import { IconBriefcase, IconEdit, IconEye, IconPlus, IconSearch, IconTrash } from '../components/icons';
import './Applications.css';

const STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];
const JOB_TYPES = ['Remote', 'On-site', 'Hybrid', 'Full-time', 'Part-time', 'Internship', 'Contract'];

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [jobType, setJobType] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getApplications({
        search: search || undefined,
        status: status || undefined,
        jobType: jobType || undefined,
        page,
        limit: 8,
      });
      setApplications(res.data.applications);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load applications. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [search, status, jobType, page]);

  useEffect(() => {
    const timeout = setTimeout(fetchApplications, 300);
    return () => clearTimeout(timeout);
  }, [fetchApplications]);

  const handleCreate = async (values) => {
    await createApplication(values);
    setModalOpen(false);
    setPage(1);
    fetchApplications();
  };

  const handleUpdate = async (values) => {
    await updateApplication(editingApp._id, values);
    setModalOpen(false);
    setEditingApp(null);
    fetchApplications();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteApplication(deleteTarget._id);
      setDeleteTarget(null);
      fetchApplications();
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to delete this application.'));
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = search || status || jobType;

  return (
    <div className="container applications-page">
      <div className="applications-header">
        <div>
          <h1>Applications</h1>
          <p>Track and manage every role you've applied to.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingApp(null);
            setModalOpen(true);
          }}
        >
          <IconPlus width={18} height={18} />
          Add application
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrap">
          <IconSearch width={17} height={17} className="search-icon" />
          <input
            className="form-input"
            style={{ paddingLeft: 38 }}
            placeholder="Search by company or position…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="form-select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="form-select"
          value={jobType}
          onChange={(e) => {
            setJobType(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All job types</option>
          {JOB_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="form-banner form-banner-error">{error}</div>}

      {loading ? (
        <PageLoader label="Loading applications…" />
      ) : applications.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<IconBriefcase width={26} height={26} />}
            title={hasFilters ? 'No applications match your filters' : 'No applications found'}
            message={
              hasFilters
                ? 'Try adjusting your search or filters.'
                : 'Start tracking your first job application to see it here.'
            }
            action={
              !hasFilters && (
                <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
                  <IconPlus width={18} height={18} />
                  Add Application
                </button>
              )
            }
          />
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Position</th>
                  <th>Job type</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td className="cell-primary">{app.company}</td>
                    <td>{app.position}</td>
                    <td className="cell-muted">{app.jobType}</td>
                    <td>
                      <Badge value={app.status} />
                    </td>
                    <td className="cell-muted">{formatDate(app.applicationDate)}</td>
                    <td>
                      <div className="row-actions">
                        <Link to={`/applications/${app._id}`} className="btn btn-ghost btn-icon" title="View details">
                          <IconEye width={16} height={16} />
                        </Link>
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon"
                          title="Edit"
                          onClick={() => {
                            setEditingApp(app);
                            setModalOpen(true);
                          }}
                        >
                          <IconEdit width={16} height={16} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon"
                          title="Delete"
                          onClick={() => setDeleteTarget(app)}
                        >
                          <IconTrash width={16} height={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <ApplicationFormModal
        open={modalOpen}
        initialData={editingApp}
        onClose={() => {
          setModalOpen(false);
          setEditingApp(null);
        }}
        onSubmit={editingApp ? handleUpdate : handleCreate}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete this application?"
        message={`This will permanently remove "${deleteTarget?.position}" at "${deleteTarget?.company}" along with any linked interviews.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
