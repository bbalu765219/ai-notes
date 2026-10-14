import React from 'react';

export default function BranchBadge({ branch }) {
  const b = (branch || 'General').toLowerCase();
  let badgeClass = 'general';

  if (b.includes('cse') || b.includes('computer')) badgeClass = 'cse';
  else if (b.includes('it') || b.includes('information')) badgeClass = 'it';
  else if (b.includes('eee') || b.includes('electrical')) badgeClass = 'eee';
  else if (b.includes('ece') || b.includes('electronics')) badgeClass = 'ece';
  else if (b.includes('mech')) badgeClass = 'mechanical';
  else if (b.includes('civil')) badgeClass = 'civil';
  else if (b.includes('diploma')) badgeClass = 'diploma';

  return (
    <span className={`branch-badge ${badgeClass}`}>
      {branch || 'General'}
    </span>
  );
}
