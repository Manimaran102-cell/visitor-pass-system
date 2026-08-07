import React from 'react';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'checked_in', label: 'Checked In' },
  { value: 'checked_out', label: 'Checked Out' },
  { value: 'cancelled', label: 'Cancelled' },
];

const VisitorFilters = ({ filters, onChange, onSubmit, showStatus = true }) => (
  <form onSubmit={onSubmit} className="card p-4 mb-4 flex flex-wrap gap-3 items-end">
    <div className="flex-1 min-w-[160px]">
      <label className="label-eyebrow block mb-1.5">Visitor Name</label>
      <input
        value={filters.visitorName}
        onChange={(e) => onChange({ ...filters, visitorName: e.target.value })}
        className="w-full rounded-lg border border-mist-200 px-3 py-2 text-sm outline-none focus:border-ink-700"
        placeholder="Search visitor…"
      />
    </div>
    <div className="flex-1 min-w-[160px]">
      <label className="label-eyebrow block mb-1.5">Employee Name</label>
      <input
        value={filters.employeeName}
        onChange={(e) => onChange({ ...filters, employeeName: e.target.value })}
        className="w-full rounded-lg border border-mist-200 px-3 py-2 text-sm outline-none focus:border-ink-700"
        placeholder="Search employee…"
      />
    </div>
    <div>
      <label className="label-eyebrow block mb-1.5">Visit Date</label>
      <input
        type="date"
        value={filters.visitDate}
        onChange={(e) => onChange({ ...filters, visitDate: e.target.value })}
        className="rounded-lg border border-mist-200 px-3 py-2 text-sm outline-none focus:border-ink-700"
      />
    </div>
    {showStatus && (
      <div>
        <label className="label-eyebrow block mb-1.5">Status</label>
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="rounded-lg border border-mist-200 px-3 py-2 text-sm outline-none focus:border-ink-700"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    )}
    <button type="submit" className="rounded-lg bg-ink-900 text-white px-4 py-2 text-sm font-semibold hover:bg-ink-800">
      Filter
    </button>
  </form>
);

export default VisitorFilters;
