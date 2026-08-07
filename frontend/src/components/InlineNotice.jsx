import React from 'react';

const TONES = {
  error: 'bg-signal-red/10 text-signal-red border-signal-red/30',
  success: 'bg-signal-green/10 text-signal-green border-signal-green/30',
  info: 'bg-signal-blue/10 text-signal-blue border-signal-blue/30',
};

const InlineNotice = ({ tone = 'error', children, onDismiss }) => {
  if (!children) return null;
  return (
    <div className={`flex items-start justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-sm font-medium ${TONES[tone]}`}>
      <span>{children}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="text-current opacity-60 hover:opacity-100">
          ✕
        </button>
      )}
    </div>
  );
};

export default InlineNotice;
