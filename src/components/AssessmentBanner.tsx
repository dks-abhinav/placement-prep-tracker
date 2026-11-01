import React from 'react';
import { Clock, Calendar, ChevronRight, AlertCircle } from 'lucide-react';
import { JobApplication, UserProfile } from '../types';

interface AssessmentBannerProps {
  applications: JobApplication[];
  profile: UserProfile;
  onNavigateToApplications: () => void;
}

export const AssessmentBanner: React.FC<AssessmentBannerProps> = ({
  applications,
  profile,
  onNavigateToApplications,
}) => {
  // Find pending OAs with date
  const upcomingAssessments = applications.filter(
    (app) => (app.status === 'OA Pending' || app.status === 'Technical Round') && app.oaOrInterviewDate
  );

  // Calculate days to placement drive
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const driveDate = new Date(profile.placementDriveDate);
  const driveDiffDays = Math.ceil((driveDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Find nearest upcoming assessment
  const sortedAssessments = [...upcomingAssessments].sort((a, b) => {
    return new Date(a.oaOrInterviewDate!).getTime() - new Date(b.oaOrInterviewDate!).getTime();
  });

  const nextAssessment = sortedAssessments[0];
  let nextDiffDays: number | null = null;
  if (nextAssessment && nextAssessment.oaOrInterviewDate) {
    const oaDate = new Date(nextAssessment.oaOrInterviewDate);
    nextDiffDays = Math.ceil((oaDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="bg-[#fef3c7] border-b border-[#fde68a] text-[#92400e] px-4 py-2.5 text-xs sm:text-sm font-medium transition-all shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center justify-center p-1 bg-amber-200/80 rounded text-amber-900">
            <Clock className="w-3.5 h-3.5" />
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-amber-950">Active Drive Alert:</span>
            {driveDiffDays > 0 ? (
              <span>
                Placement Day 0 begins in{' '}
                <strong className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-amber-950 font-bold">
                  {driveDiffDays} days
                </strong>{' '}
                ({profile.placementDriveDate})
              </span>
            ) : (
              <span className="font-bold text-amber-900">Day 0 Drive in Progress!</span>
            )}
          </div>

          {nextAssessment && (
            <span className="hidden md:inline-flex items-center gap-1 border-l border-amber-300 pl-2 text-amber-900">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
              <span>
                Nearest OA:{' '}
                <strong className="text-amber-950">{nextAssessment.company}</strong> (
                {nextAssessment.status}) in{' '}
                <span className="font-mono font-bold">
                  {nextDiffDays !== null && nextDiffDays <= 0
                    ? 'TODAY'
                    : `${nextDiffDays} day${nextDiffDays === 1 ? '' : 's'}`}
                </span>
              </span>
            </span>
          )}
        </div>

        <button
          onClick={onNavigateToApplications}
          className="inline-flex items-center gap-1 self-start sm:self-auto text-xs font-semibold text-amber-950 bg-amber-200/80 hover:bg-amber-200 px-2.5 py-1 rounded transition-colors"
        >
          <Calendar className="w-3 h-3" />
          View Application Deadlines
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
