'use client';

import React from 'react';

const version = process.env.NEXT_PUBLIC_APP_VERSION || 'dev';
const deployedAt = process.env.NEXT_PUBLIC_DEPLOY_TIME || '';

export default function VersionBadge() {
  return (
    <div
      title={deployedAt ? `Deployed at ${deployedAt}` : undefined}
      className="fixed bottom-3 right-3 z-50 select-none"
    >
      <span className="inline-flex items-center gap-2 rounded-full bg-black/70 text-white px-3 py-1 text-xs shadow-lg">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>v{version}</span>
      </span>
    </div>
  );
}
