import React from 'react';
import StatusBadge from './StatusBadge';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');
const fmtTime = (d) => (d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—');

const VisitorTable = ({ visits, renderActions, onRowClick }) => (
  <div className="card overflow-hidden overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-mist-100 text-left">
        <tr>
          <th className="px-4 py-3 font-semibold text-ink-700">Visitor</th>
          <th className="px-4 py-3 font-semibold text-ink-700">Employee</th>
          <th className="px-4 py-3 font-semibold text-ink-700">Visit Date</th>
          <th className="px-4 py-3 font-semibold text-ink-700">Arrival</th>
          <th className="px-4 py-3 font-semibold text-ink-700">Check In / Out</th>
          <th className="px-4 py-3 font-semibold text-ink-700">Status</th>
          {renderActions && <th className="px-4 py-3"></th>}
        </tr>
      </thead>
      <tbody>
        {visits.map((v) => (
          <tr
            key={v._id}
            className={`border-t border-mist-200 ${onRowClick ? 'cursor-pointer hover:bg-mist-50' : ''}`}
            onClick={() => onRowClick?.(v)}
          >
            <td className="px-4 py-3">
              <p className="font-medium">{v.visitorName}</p>
              <p className="text-ink-600 text-xs">{v.visitorPhone}</p>
            </td>
            <td className="px-4 py-3">
              <p>{v.employeeToVisit?.name || '—'}</p>
              <p className="text-ink-600 text-xs">{v.employeeToVisit?.department}</p>
            </td>
            <td className="px-4 py-3">{fmtDate(v.visitDate)}</td>
            <td className="px-4 py-3">{v.expectedArrivalTime}</td>
            <td className="px-4 py-3 text-ink-600">
              {fmtTime(v.checkInTime)} → {fmtTime(v.checkOutTime)}
            </td>
            <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
            {renderActions && (
              <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                {renderActions(v)}
              </td>
            )}
          </tr>
        ))}
        {visits.length === 0 && (
          <tr>
            <td colSpan={7} className="px-4 py-10 text-center text-ink-600">No visitor records found.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default VisitorTable;
