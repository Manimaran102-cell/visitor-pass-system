import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';

const ACTION_COLORS = {
  Created: 'text-signal-blue',
  Approved: 'text-signal-green',
  Rejected: 'text-signal-red',
  'Checked In': 'text-signal-green',
  'Checked Out': 'text-ink-700',
  Cancelled: 'text-ink-600',
};

const ActivityHistory = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/reports/activity').then((res) => setLogs(res.data));
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Audit Trail"
        title="Activity History"
        description="Every action performed on every visitor request, most recent first."
      />
      <div className="card divide-y divide-mist-200">
        {logs.map((log) => (
          <div key={log._id} className="px-4 py-3.5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm">
                <span className={`font-semibold ${ACTION_COLORS[log.action] || 'text-ink-900'}`}>{log.action}</span>{' '}
                <span className="text-ink-600">
                  — {log.visitRequest?.visitorName || 'Unknown visitor'} visiting{' '}
                  {log.visitRequest?.employeeToVisit?.name || 'unknown employee'}
                </span>
              </p>
              <p className="text-xs text-ink-600 mt-0.5">
                by {log.performedBy?.name} ({log.performedBy?.role}) {log.remarks ? `— "${log.remarks}"` : ''}
              </p>
            </div>
            <p className="text-xs text-ink-600 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</p>
          </div>
        ))}
        {logs.length === 0 && <p className="px-4 py-10 text-center text-ink-600 text-sm">No activity recorded yet.</p>}
      </div>
    </div>
  );
};

export default ActivityHistory;
