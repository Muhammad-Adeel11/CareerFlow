import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getApplicationStats } from '../services/applicationService';
import { getErrorMessage } from '../services/api';
import PageLoader from '../components/PageLoader';
import { IconArrowRight, IconBriefcase, IconCalendar, IconChart, IconPlus } from '../components/icons';
import './Dashboard.css';

const STATUS_COLORS = {
  Applied: '#6366f1',
  Interview: '#f59e0b',
  Offer: '#10b981',
  Rejected: '#ef4444',
  Withdrawn: '#9298ab',
};

function StatCard({ label, value, icon: Icon, tone }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-icon">
        <Icon width={20} height={20} />
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    getApplicationStats()
      .then((res) => {
        if (active) setStats(res.data);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, 'Unable to load dashboard data.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <PageLoader label="Loading your dashboard…" />;

  if (error) {
    return (
      <div className="container" style={{ padding: '60px 0' }}>
        <div className="form-banner form-banner-error">{error}</div>
      </div>
    );
  }

  const statusData = Object.entries(stats.statusCounts).map(([status, count]) => ({ status, count }));
  const hasApplications = stats.total > 0;
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="container dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {firstName} 👋</h1>
          <p>Here's a snapshot of your job search progress.</p>
        </div>
        <Link to="/applications" className="btn btn-primary">
          <IconPlus width={18} height={18} />
          Add application
        </Link>
      </div>

      <div className="stat-grid">
        <StatCard label="Total applications" value={stats.total} icon={IconBriefcase} tone="primary" />
        <StatCard label="Applied" value={stats.statusCounts.Applied || 0} icon={IconChart} tone="info" />
        <StatCard label="Interviews" value={stats.interviewsCount} icon={IconCalendar} tone="warning" />
        <StatCard label="Offers" value={stats.statusCounts.Offer || 0} icon={IconArrowRight} tone="success" />
      </div>

      {!hasApplications ? (
        <div className="card card-padded" style={{ marginTop: 24 }}>
          <div className="empty-state">
            <div className="empty-state-icon">
              <IconBriefcase width={26} height={26} />
            </div>
            <h3>No applications yet</h3>
            <p>Start tracking your first job application to see your stats and charts here.</p>
            <Link to="/applications" className="btn btn-primary">
              <IconPlus width={18} height={18} />
              Add your first application
            </Link>
          </div>
        </div>
      ) : (
        <div className="chart-grid">
          <div className="card card-padded chart-card">
            <h3 className="chart-title">Applications by status</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData.filter((d) => d.count > 0)}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={92}
                  paddingAngle={3}
                >
                  {statusData
                    .filter((d) => d.count > 0)
                    .map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card card-padded chart-card">
            <h3 className="chart-title">Applications over time</h3>
            {stats.overTime.length > 1 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={stats.overTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e4ec" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7186' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7186' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e4ec" />
                  <XAxis dataKey="status" tick={{ fontSize: 12, fill: '#6b7186' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7186' }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {statusData.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
