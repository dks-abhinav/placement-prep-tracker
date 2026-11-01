import React from 'react';
import { DSADifficulty, ApplicationStatus, CompanyTier } from '../../types';

interface DifficultyBadgeProps {
  difficulty: DSADifficulty;
  size?: 'sm' | 'md';
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs';

  if (difficulty === 'Easy') {
    return (
      <span
        className={`inline-flex items-center font-mono font-medium rounded border bg-[#ecfdf5] text-[#047857] border-[#a7f3d0] ${sizeClasses}`}
      >
        Easy
      </span>
    );
  }
  if (difficulty === 'Medium') {
    return (
      <span
        className={`inline-flex items-center font-mono font-medium rounded border bg-[#fffbeb] text-[#b45309] border-[#fde68a] ${sizeClasses}`}
      >
        Medium
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded border bg-[#fef2f2] text-[#b91c1c] border-[#fecaca] ${sizeClasses}`}
    >
      Hard
    </span>
  );
};

interface TierBadgeProps {
  tier: CompanyTier;
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tier }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#f1f5f9] text-[#334155] border border-[#e2e8f0]">
      {tier}
    </span>
  );
};

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'Offered':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
          ✓ Offered
        </span>
      );
    case 'OA Pending':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fffbeb] text-[#b45309] border border-[#fde68a]">
          ⏱ OA Pending
        </span>
      );
    case 'Technical Round':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
          💼 Tech Round
        </span>
      );
    case 'HR Round':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f5f3ff] text-[#6d28d9] border border-[#ddd6fe]">
          🤝 HR Round
        </span>
      );
    case 'Applied':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f8fafc] text-[#475569] border border-[#cbd5e1]">
          Applied
        </span>
      );
    case 'Wishlist':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]">
          Wishlist
        </span>
      );
    case 'Rejected':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]">
          Rejected
        </span>
      );
    default:
      return null;
  }
};
