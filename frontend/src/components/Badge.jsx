const CLASS_MAP = {
  Applied: 'badge-applied',
  Interview: 'badge-interview',
  Offer: 'badge-offer',
  Rejected: 'badge-rejected',
  Withdrawn: 'badge-withdrawn',
  Scheduled: 'badge-scheduled',
  Completed: 'badge-completed',
  Cancelled: 'badge-cancelled',
  ADMIN: 'badge-admin',
  USER: 'badge-user',
};

export default function Badge({ value }) {
  const cls = CLASS_MAP[value] || 'badge-withdrawn';
  return <span className={`badge ${cls}`}>{value}</span>;
}
