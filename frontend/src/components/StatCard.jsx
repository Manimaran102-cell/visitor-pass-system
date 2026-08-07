import React from 'react';

const StatCard = ({ label, value, accent = 'ink' }) => {
  const accentClass = {
    ink: 'text-ink-900',
    brass: 'text-brass-600',
    green: 'text-signal-green',
    blue: 'text-signal-blue',
    red: 'text-signal-red',
  }[accent];

  return (
    <div className="card p-5">
      <p className="label-eyebrow">{label}</p>
      <p className={`mt-2 font-display text-4xl font-semibold ${accentClass}`}>{value}</p>
    </div>
  );
};

export default StatCard;
