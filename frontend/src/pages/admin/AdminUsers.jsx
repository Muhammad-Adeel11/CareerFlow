import { useEffect, useState } from 'react';
import { getUsers, deleteUser } from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import { formatDate } from '../../utils/validators';
import Badge from '../../components/Badge';
import PageLoader from '../../components/PageLoader';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import { IconTrash, IconUsers } from '../../components/icons';
import './Admin.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    setError('');
    getUsers()
      .then((res) => setUsers(res.data.users))
      .catch((err) => setError(getErrorMessage(err, 'Unable to load users.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to delete this user.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container applications-page">
      <div className="applications-header">
        <div>
          <h1>Users</h1>
          <p>All registered CareerFlow accounts.</p>
        </div>
      </div>

      {error && <div className="form-banner form-banner-error">{error}</div>}

      {loading ? (
        <PageLoader label="Loading users…" />
      ) : users.length === 0 ? (
        <div className="card">
          <EmptyState icon={<IconUsers width={26} height={26} />} title="No users found" message="No accounts have registered yet." />
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="cell-primary">{u.name}</td>
                  <td className="cell-muted">{u.email}</td>
                  <td>
                    <Badge value={u.role} />
                  </td>
                  <td className="cell-muted">{formatDate(u.createdAt)}</td>
                  <td>
                    <div className="row-actions">
                      {u.role !== 'ADMIN' && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon"
                          title="Remove user"
                          onClick={() => setDeleteTarget(u)}
                        >
                          <IconTrash width={16} height={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Remove this user?"
        message={`This will permanently delete "${deleteTarget?.name}" and all of their applications and interviews.`}
        confirmLabel="Remove user"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
