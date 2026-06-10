import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isFresh = status === 'fresh';
  const isRotten = status === 'rotten';
  
  let styles = 'bg-yellow-100 text-yellow-800';
  if (isFresh) styles = 'bg-green-100 text-green-800';
  if (isRotten) styles = 'bg-red-100 text-red-800';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles}`}>
      {status.toUpperCase()}
    </span>
  );
}
