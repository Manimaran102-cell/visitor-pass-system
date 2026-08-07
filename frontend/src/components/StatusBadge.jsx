import React from 'react';

const STATUS_STYLES = {
  pending: 'bg-brass-400/15 text-brass-600 border-brass-400/40',
  approved: 'bg-signal-blue/10 text-signal-blue border-signal-blue/30',
  rejected: 'bg-signal-red/10 text-signal-red border-signal-red/30',
  checked_in: 'bg-signal-green/10 text-signal-green border-signal-green/30',
  checked_out: 'bg-ink-800/10 text-ink-700 border-ink-700/30',
  cancelled: 'bg-mist-200 text-ink-600 border-mist-200',
};

const STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  checked_in: 'Checked In',
  checked_out: 'Checked Out',
  cancelled: 'Cancelled',
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
      STATUS_STYLES[status] || 'bg-mist-200 text-ink-600 border-mist-200'
    }`}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {STATUS_LABELS[status] || status}
  </span>
);

export default StatusBadge;
