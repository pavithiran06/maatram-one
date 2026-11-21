import React from 'react';
import clsx from 'clsx';
import { ActivityStatus, RegistrationStatus, AvailabilityResponseType, VerificationStatus, AccountStatus, InvitationStatus } from '../../types';

interface StatusBadgeProps {
  status: string;
  type?: 'activity' | 'registration' | 'availability' | 'verification' | 'account' | 'invitation' | 'generic';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'generic', className }) => {
  const getStyles = () => {
    switch (status.toUpperCase()) {
      // Activity statuses
      case 'PUBLISHED':
      case 'ACTIVE':
      case 'CONFIRMED':
      case 'AVAILABLE':
      case 'FINALIZED':
      case 'APPROVED':
      case 'DELIVERED':
      case 'ISSUED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';

      case 'IN_PROGRESS':
      case 'PENDING':
      case 'PENDING_FINALIZATION':
      case 'MAYBE':
      case 'ELIGIBILITY_PENDING':
      case 'NOT_FINALIZED':
        return 'bg-amber-50 text-amber-800 border-amber-200';

      case 'REGISTRATION_CLOSED':
      case 'WAITLISTED':
      case 'SENT':
        return 'bg-blue-50 text-blue-800 border-blue-200';

      case 'COMPLETED':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';

      case 'ARCHIVED':
      case 'CLOSED':
      case 'NOT_SENT':
      case 'NOT_READY':
        return 'bg-slate-100 text-slate-700 border-slate-200';

      case 'REJECTED':
      case 'UNAVAILABLE':
      case 'DECLINED':
      case 'ABSENT':
      case 'SUSPENDED':
      case 'INACTIVE_REVIEW':
        return 'bg-rose-50 text-rose-800 border-rose-200';

      case 'EXCUSED':
        return 'bg-purple-50 text-purple-800 border-purple-200';

      case 'DRAFT':
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ');
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border',
        getStyles(),
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 mr-1.5" />
      {formatText(status)}
    </span>
  );
};
