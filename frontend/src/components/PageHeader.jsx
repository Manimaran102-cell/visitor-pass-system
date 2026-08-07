import React from 'react';

const PageHeader = ({ eyebrow, title, description, actions }) => (
  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
    <div>
      {eyebrow && <p className="label-eyebrow mb-1.5">{eyebrow}</p>}
      <h1 className="font-display text-2xl font-semibold text-ink-900">{title}</h1>
      {description && <p className="text-sm text-ink-600 mt-1 max-w-xl">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

export default PageHeader;
