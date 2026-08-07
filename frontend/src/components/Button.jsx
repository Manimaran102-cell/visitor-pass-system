import React from 'react';

const VARIANTS = {
  primary: 'bg-ink-900 text-white hover:bg-ink-800 disabled:bg-ink-900/40',
  brass: 'bg-brass-500 text-white hover:bg-brass-600 disabled:bg-brass-500/40',
  outline: 'bg-white text-ink-900 border border-mist-200 hover:border-ink-700 disabled:opacity-40',
  danger: 'bg-white text-signal-red border border-signal-red/40 hover:bg-signal-red/10 disabled:opacity-40',
  ghost: 'bg-transparent text-ink-700 hover:bg-mist-100 disabled:opacity-40',
};

const Button = ({ variant = 'primary', className = '', children, ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
