import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSystemStats } from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import { formatDate } from '../../utils/validators';
import PageLoader from '../../components/PageLoader';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { IconBriefcase, IconCalendar, IconUsers, IconChart } from '../../components/icons';
import '../Dashboard.css';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getSystemStats()
      .then((res) => {
        if (active) setStats(res.data);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, 'Unable to load admin statistics.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <PageLoader label="Loading admin dashboard…" />;
  if (error) {
    return (
      <div className="container" style={{ padding: '60px 0' }}>
        <div className="form-banner form-banner-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Admin dashboard</h1>
          <p>System-wide overview of CareerFlow usage.</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">
            <IconUsers width={20} height={20} />
          </div>
          <div>
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Registered users</div>
          </div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-icon">
            <IconBriefcase width={20} height={20} />
          </div>
          <div>
            <div className="stat-value">{stats.totalApplications}</div>
            <div className="stat-label">Total applications</div>
          </div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-icon">
            <IconCalendar width={20} height={20} />
          </div>
          <div>
            <div className="stat-value">{stats.totalInterviews}</div>
            <div className="stat-label">Total interviews</div>
          </div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-icon">
            <IconChart width={20} height={20} />
          </div>
          <div>
            <div className="stat-value">{stats.statusCounts.Offer || 0}</div>
            <div className="stat-label">Offers made</div>
          </div>
        </div>
      </div>

      <div className="admin-panels">
        <div className="card card-padded">
          <h3 className="chart-title">Applications by status</h3>
          <div className="status-breakdown">
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <div key={status} className="status-row">
                <Badge value={status} />
                <span className="status-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-padded">
          <div className="admin-panel-header">
            <h3 className="chart-title" style={{ marginBottom: 0 }}>
              Recent activity
            </h3>
            <Link to="/admin/users" className="text-muted" style={{ fontSize: '0.8125rem' }}>
              View all users →
            </Link>
          </div>
          {stats.recentApplications.length === 0 ? (
            <EmptyState title="No activity yet" message="Applications will show up here as users add them." />
          ) : (
            <ul className="activity-list">
              {stats.recentApplications.map((app) => (
                <li key={app._id} className="activity-item">
                  <div>
                    <div className="activity-title">
                      {app.position} at {app.company}
                    </div>
                    <div className="activity-meta">
                      {app.userId?.name || 'Unknown user'} &middot; {formatDate(app.createdAt)}
                    </div>
                  </div>
                  <Badge value={app.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
