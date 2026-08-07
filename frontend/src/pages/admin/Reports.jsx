import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Button from '../../components/Button';

const RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'custom', label: 'Custom Range' },
];

const STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  checked_in: 'Checked In',
  checked_out: 'Checked Out',
  cancelled: 'Cancelled',
};

const Reports = () => {
  const [range, setRange] = useState('today');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const params = { range };
      if (range === 'custom') {
        if (!from || !to) return setError('Select both a start and end date for a custom range.');
        params.from = from;
        params.to = to;
      }
      const { data } = await api.get('/reports/summary', { params });
      setSummary(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxDeptCount = summary?.byDepartment?.length ? Math.max(...summary.byDepartment.map((d) => d.count)) : 1;

  return (
    <div>
      <PageHeader
        eyebrow="Analytics"
        title="Visitor Reports"
        description="Summary statistics for a chosen date range."
      />

      <div className="card p-4 mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="label-eyebrow block mb-1.5">Range</label>
          <select value={range} onChange={(e) => setRange(e.target.value)}
            className="rounded-lg border border-mist-200 px-3 py-2 text-sm outline-none focus:border-ink-700">
            {RANGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {range === 'custom' && (
          <>
            <div>
              <label className="label-eyebrow block mb-1.5">From</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                className="rounded-lg border border-mist-200 px-3 py-2 text-sm outline-none focus:border-ink-700" />
            </div>
            <div>
              <label className="label-eyebrow block mb-1.5">To</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                className="rounded-lg border border-mist-200 px-3 py-2 text-sm outline-none focus:border-ink-700" />
            </div>
          </>
        )}
        <Button onClick={load}>Run Report</Button>
      </div>

      {error && <p className="text-signal-red text-sm mb-4">{error}</p>}

      {summary && (
        <div className="space-y-6">
          <StatCard label="Total Visits in Range" value={summary.totalVisits} accent="brass" />

          <div className="card p-5">
            <p className="label-eyebrow mb-3">Status Breakdown</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <div key={key} className="rounded-lg bg-mist-50 border border-mist-200 px-3 py-2.5">
                  <p className="text-2xl font-display font-semibold text-ink-900">{summary.statusBreakdown[key] || 0}</p>
                  <p className="text-xs text-ink-600">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <p className="label-eyebrow mb-3">Visits by Department</p>
            <div className="space-y-2.5">
              {summary.byDepartment.map((d) => (
                <div key={d.department} className="flex items-center gap-3">
                  <p className="w-32 text-sm shrink-0 truncate">{d.department}</p>
                  <div className="flex-1 h-3 bg-mist-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brass-500 rounded-full"
                      style={{ width: `${(d.count / maxDeptCount) * 100}%` }}
                    />
                  </div>
                  <p className="w-8 text-sm text-right text-ink-600">{d.count}</p>
                </div>
              ))}
              {summary.byDepartment.length === 0 && <p className="text-sm text-ink-600">No visits in this range.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
