import React from 'react';

const Modal = ({ open, onClose, title, children, width = 'max-w-md' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative w-full ${width} card p-6`}>
        <div className="mb-4 flex items-start justify-between">
          <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-ink-600 hover:text-ink-900 rounded-md p-1"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
