import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStorage, useCurrentUser } from '../../hooks/useStorage';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ActivityStatus, RegistrationStatus, AvailabilityResponseType, AttendanceStatus } from '../../types';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  UserCheck, 
  Award, 
  MessageSquare, 
  CheckCircle, 
  FileText, 
  CheckCheck, 
  AlertCircle, 
  ShieldCheck, 
  ChevronRight, 
  Send, 
  XCircle, 
  Archive, 
  Download,
  Share2,
  Printer
} from 'lucide-react';
import clsx from 'clsx';

export const ActivityDetailPage: React.FC = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const storage = useStorage();
  const [currentUser] = useCurrentUser();
  const navigate = useNavigate();

  const activity = storage.getActivityById(activityId || 'A001');
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'REGISTRATIONS' | 'AVAILABILITY' | 'VOLUNTEERS' | 'GROUP' | 'ATTENDANCE' | 'CERTIFICATES' | 'REPORT'
  >('OVERVIEW');

  const [toast, setToast] = useState<string | null>(null);
  const [previewCertVolunteerId, setPreviewCertVolunteerId] = useState<string | null>(null);
  const [auditReasonModal, setAuditReasonModal] = useState<{ attendanceId: string; hours: number } | null>(null);
  const [auditReasonText, setAuditReasonText] = useState('');

  if (!activity) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Activity Not Found</h2>
        <p className="text-xs text-slate-500">The activity you are looking for does not exist in the platform.</p>
        <Link to="/admin/opportunities" className="inline-block px-4 py-2 bg-maatram-primary text-white text-xs font-semibold rounded-lg">
          Back to Activities
        </Link>
      </div>
    );
  }

  const categories = storage.getCategories();
  const category = categories.find((c) => c.category_id === activity.category_id);
  const registrations = storage.getRegistrationsForActivity(activity.activity_id);
  const availability = storage.getAvailabilityForActivity(activity.activity_id);
  const attendance = storage.getAttendanceForActivity(activity.activity_id);
  const certificates = storage.getCertificatesForActivity(activity.activity_id);
  const group = storage.getGroupByActivityId(activity.activity_id);
  const allUsers = storage.getUsers();

  const approvedRegistrations = registrations.filter((r) => r.status === 'APPROVED');
  const pendingRegistrations = registrations.filter((r) => r.status === 'PENDING');
  const waitlistedRegistrations = registrations.filter((r) => r.status === 'WAITLISTED');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Lifecycle Progression
  const lifecycleSteps: ActivityStatus[] = [
    'DRAFT',
    'PUBLISHED',
    'REGISTRATION_CLOSED',
    'IN_PROGRESS',
    'PENDING_FINALIZATION',
    'COMPLETED',
    'ARCHIVED',
  ];

  const currentStepIndex = lifecycleSteps.indexOf(activity.status);

  const handleUpdateStatus = (newStatus: ActivityStatus) => {
    storage.updateActivityStatus(activity.activity_id, newStatus);
    showToast(`Activity status moved to ${newStatus}`);
  };

  // Registration Actions
  const handleRegStatus = (regId: string, status: RegistrationStatus, note?: string) => {
    storage.updateRegistrationStatus(regId, status, note);
    showToast(`Registration marked as ${status}`);
  };

  // Availability Actions
  const handleSendInvitation = (responseId: string) => {
    storage.updateInvitationStatus(responseId, 'SENT');
    showToast('Invitation dispatched to volunteer');
  };

  const handleConfirmParticipation = (responseId: string) => {
    storage.updateInvitationStatus(responseId, 'CONFIRMED');
    showToast('Volunteer participation formally confirmed by Admin');
  };

  // Attendance Actions
  const handleMarkAttendance = (userId: string, status: AttendanceStatus) => {
    const existing = attendance.find((a) => a.user_id === userId);
    const dateStr = activity.start_date;
    const checkIn = status === 'PRESENT' ? `${dateStr} ${activity.start_time}` : undefined;
    const checkOut = status === 'PRESENT' ? `${dateStr} ${activity.end_time}` : undefined;
    
    // Calculate duration in hours
    let calcHours = 0;
    if (checkIn && checkOut) {
      const [sh, sm] = activity.start_time.split(':').map(Number);
      const [eh, em] = activity.end_time.split(':').map(Number);
      calcHours = Number(((eh * 60 + em - (sh * 60 + sm)) / 60).toFixed(2));
    }

    storage.saveAttendanceRecord({
      attendance_id: existing?.attendance_id,
      activity_id: activity.activity_id,
      user_id: userId,
      attendance_status: status,
      check_in: checkIn,
      check_out: checkOut,
      hours_calculated: calcHours,
      hours_verified: existing?.hours_verified || (status === 'PRESENT' ? calcHours : 0),
      verification_status: existing?.verification_status || 'NOT_FINALIZED',
      verified_by: existing?.verified_by,
      correction_reason: existing?.correction_reason,
    });
    showToast(`Attendance updated to ${status}`);
  };

  const handleFinalizeHours = (attendanceId: string, hours: number) => {
    storage.finalizeAttendance(attendanceId, hours);
    showToast(`Verified hours finalized at ${hours} hrs`);
  };

  const handleIssueCertificate = (userId: string) => {
    const cert = storage.issueCertificate(activity.activity_id, userId);
    showToast(`Certificate ${cert.certificate_number} issued successfully!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top duration-200">
          <div className="bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-elevated border border-emerald-700 flex items-center space-x-2 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* Breadcrumb & Navigation */}
      <div className="flex items-center space-x-2 text-xs text-slate-500">
        <Link to="/admin/opportunities" className="hover:text-maatram-primary flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Opportunities</span>
        </Link>
        <span>/</span>
        <span className="font-mono text-slate-700">{activity.activity_id}</span>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate max-w-xs">{activity.title}</span>
      </div>

      {/* Main Top Card with Lifecycle Stepper */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-maatram-primary bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">
                {category?.category_name || activity.category_id}
              </span>
              <StatusBadge status={activity.status} type="activity" />
              <span className="text-xs font-mono text-slate-400">ID: {activity.activity_id}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">{activity.title}</h1>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">{activity.description}</p>
          </div>

          {/* Quick Lifecycle status button */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Lifecycle Stage
            </span>
            <div className="flex items-center gap-1.5">
              {currentStepIndex < lifecycleSteps.length - 1 && (
                <button
                  onClick={() => handleUpdateStatus(lifecycleSteps[currentStepIndex + 1])}
                  className="px-3.5 py-1.5 rounded-lg bg-maatram-primary hover:bg-maatram-hover text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
                >
                  <span>Advance to {lifecycleSteps[currentStepIndex + 1].replace(/_/g, ' ')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lifecycle Stepper Bar */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Activity Lifecycle Progression</span>
            <span>Current: {activity.status.replace(/_/g, ' ')}</span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {lifecycleSteps.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <button
                  key={step}
                  onClick={() => handleUpdateStatus(step)}
                  className={clsx(
                    'py-2 px-1 text-center rounded-md font-bold text-[10px] truncate transition-all',
                    isCurrent
                      ? 'bg-maatram-primary text-white shadow-sm ring-2 ring-maatram-gold'
                      : isPast
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  )}
                  title={`Click to set status to ${step}`}
                >
                  {step.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Key Metrics Quick Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Schedule</span>
            <p className="font-bold text-slate-900 mt-0.5">{activity.start_date}</p>
            <p className="text-[11px] text-slate-500">{activity.start_time} – {activity.end_time}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Mode & Venue</span>
            <p className="font-bold text-slate-900 mt-0.5">{activity.mode}</p>
            <p className="text-[11px] text-slate-500 truncate">{activity.location}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Capacity</span>
            <p className="font-bold text-slate-900 mt-0.5">
              {approvedRegistrations.length} / {activity.capacity} Approved
            </p>
            <p className="text-[11px] text-slate-500">{pendingRegistrations.length} pending</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Certificates</span>
            <p className="font-bold text-emerald-800 mt-0.5">
              {activity.certificate_enabled === 'Yes' ? 'Enabled' : 'Disabled'}
            </p>
            <p className="text-[11px] text-slate-500">{certificates.filter(c => c.issue_status === 'ISSUED').length} issued</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Coordinator</span>
            <p className="font-bold text-slate-900 mt-0.5">{activity.coordinator}</p>
            <p className="text-[11px] text-slate-500">Office Team</p>
          </div>
        </div>
      </div>

      {/* 8-Tab Navigation Bar */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-4 shadow-subtle">
        <nav className="flex space-x-4 overflow-x-auto text-xs font-bold py-1" aria-label="Activity Management Tabs">
          {[
            { id: 'OVERVIEW', label: '1. Overview', icon: FileText },
            { id: 'REGISTRATIONS', label: `2. Registrations (${registrations.length})`, icon: UserCheck },
            { id: 'AVAILABILITY', label: `3. Availability (${availability.length})`, icon: Clock },
            { id: 'VOLUNTEERS', label: `4. Confirmed Roster (${approvedRegistrations.length})`, icon: Users },
            { id: 'GROUP', label: '5. Coordination Group', icon: MessageSquare },
            { id: 'ATTENDANCE', label: `6. Attendance (${attendance.length})`, icon: CheckCheck },
            { id: 'CERTIFICATES', label: `7. Certificates (${certificates.length})`, icon: Award },
            { id: 'REPORT', label: '8. Report & Finalization', icon: Archive },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  'py-3.5 px-2 border-b-2 font-semibold flex items-center space-x-1.5 transition-colors whitespace-nowrap',
                  isActive
                    ? 'border-maatram-primary text-maatram-primary font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                )}
              >
                <Icon className={clsx('w-3.5 h-3.5', isActive ? 'text-maatram-primary' : 'text-slate-400')} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-6 shadow-subtle">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Activity Specification</h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Activity ID:</span>
                  <span className="font-mono font-bold text-slate-800">{activity.activity_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-semibold text-slate-800">{category?.category_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Start Date & Time:</span>
                  <span className="font-semibold text-slate-800">{activity.start_date} at {activity.start_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">End Date & Time:</span>
                  <span className="font-semibold text-slate-800">{activity.end_date} at {activity.end_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-semibold text-slate-800">{activity.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Participation Mode:</span>
                  <span className="font-bold text-slate-800">{activity.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registration Deadline:</span>
                  <span className="font-semibold text-slate-800">{activity.registration_deadline}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Workflow Readiness</h3>
              <div className="space-y-3">
                <div className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">Coordination Group</p>
                    <p className="text-slate-500">{group ? group.group_name : 'No group created'}</p>
                  </div>
                  {group ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {group.status}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px]">Missing</span>
                  )}
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">Attendance Verification</p>
                    <p className="text-slate-500">{attendance.filter(a => a.verification_status === 'FINALIZED').length} records finalized</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                    {attendance.length} Total Logs
                  </span>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">Certificates Distribution</p>
                    <p className="text-slate-500">
                      {activity.certificate_enabled === 'Yes' ? 'Enabled for eligible verified attendees' : 'Activity configured without certificates'}
                    </p>
                  </div>
                  <span className={clsx(
                    'px-2 py-0.5 rounded font-bold text-[10px]',
                    activity.certificate_enabled === 'Yes' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  )}>
                    {activity.certificate_enabled === 'Yes' ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REGISTRATIONS */}
      {activeTab === 'REGISTRATIONS' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-4 shadow-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Application Queue & Capacity Review</h3>
              <p className="text-xs text-slate-500">
                Review registrations, approve eligible volunteers, manage waitlists, and prevent overbooking.
              </p>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                {approvedRegistrations.length} Approved
              </span>
              <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                {pendingRegistrations.length} Pending
              </span>
              <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200 font-semibold">
                {waitlistedRegistrations.length} Waitlisted
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">Role & Affiliation</th>
                  <th className="px-4 py-3">Applied At</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Admin Note</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrations.map((reg) => {
                  const applicant = allUsers.find((u) => u.user_id === reg.user_id);
                  return (
                    <tr key={reg.registration_id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900">{applicant?.full_name || reg.user_id}</p>
                        <p className="text-[11px] font-mono text-slate-400">{reg.user_id}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {applicant?.role}
                        </span>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {applicant?.employer_org || applicant?.department_or_batch}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{reg.applied_at}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={reg.status} type="registration" />
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 italic">
                        {reg.admin_note || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {reg.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleRegStatus(reg.registration_id, 'APPROVED', 'Approved by Office Admin')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px]"
                          >
                            Approve
                          </button>
                        )}
                        {reg.status !== 'WAITLISTED' && (
                          <button
                            onClick={() => handleRegStatus(reg.registration_id, 'WAITLISTED', 'Placed on waitlist')}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded text-[11px]"
                          >
                            Waitlist
                          </button>
                        )}
                        {reg.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleRegStatus(reg.registration_id, 'REJECTED', 'Capacity reached / not eligible')}
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold rounded text-[11px]"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AVAILABILITY & INVITATIONS */}
      {activeTab === 'AVAILABILITY' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Volunteer Availability & Invitation Pipeline</h3>
              <p className="text-xs text-slate-500">
                Track volunteer willingness (Available / Unavailable / Maybe) and send formal invitations to alternatives.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Volunteer</th>
                  <th className="px-4 py-3">Role & Affiliation</th>
                  <th className="px-4 py-3">Request Sent</th>
                  <th className="px-4 py-3">Response</th>
                  <th className="px-4 py-3">Responded At</th>
                  <th className="px-4 py-3">Invitation Status</th>
                  <th className="px-4 py-3 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {availability.map((avail) => {
                  const volunteer = allUsers.find((u) => u.user_id === avail.user_id);
                  return (
                    <tr key={avail.response_id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900">{volunteer?.full_name}</p>
                        <p className="text-[11px] font-mono text-slate-400">{avail.user_id}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {volunteer?.role}
                        </span>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {volunteer?.employer_org || volunteer?.department_or_batch}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{avail.request_sent_at}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={avail.response} type="availability" />
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{avail.responded_at || 'Awaiting response'}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={avail.invitation_status} type="invitation" />
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1.5">
                        {avail.invitation_status === 'NOT_SENT' && (
                          <button
                            onClick={() => handleSendInvitation(avail.response_id)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-[11px] inline-flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Send Invitation</span>
                          </button>
                        )}
                        {avail.invitation_status !== 'CONFIRMED' && (
                          <button
                            onClick={() => handleConfirmParticipation(avail.response_id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px] inline-flex items-center gap-1"
                          >
                            <CheckCheck className="w-3 h-3" />
                            <span>Confirm Participation</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CONFIRMED VOLUNTEER ROSTER */}
      {activeTab === 'VOLUNTEERS' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Confirmed Team Roster</h3>
              <p className="text-xs text-slate-500">
                Official list of approved volunteers. Privacy is preserved: personal contact details are restricted to Office Admin.
              </p>
            </div>
            <span className="text-xs font-bold text-maatram-primary bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {approvedRegistrations.length} of {activity.capacity} Slots Filled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedRegistrations.map((reg) => {
              const volunteer = allUsers.find((u) => u.user_id === reg.user_id);
              const pref = storage.getPreferencesForUser(reg.user_id);
              const hasDnc = pref.volunteer_dnc === 'Yes' || pref.admin_dnc === 'Yes';

              return (
                <div key={reg.registration_id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{volunteer?.full_name}</h4>
                      <p className="text-xs text-slate-500">{volunteer?.employer_org || volunteer?.department_or_batch}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {volunteer?.role}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-slate-600 pt-2 border-t border-slate-200/60">
                    <p className="flex justify-between">
                      <span className="text-slate-400">Volunteer Since:</span>
                      <span>{volunteer?.volunteer_since}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Skills:</span>
                      <span className="truncate max-w-[150px]">{volunteer?.skills}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Contact Policy:</span>
                      <span className={hasDnc ? 'text-rose-600 font-bold' : 'text-emerald-700'}>
                        {hasDnc ? 'DO NOT CONTACT (Restricted)' : 'Active (Standard)'}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: GROUP */}
      {activeTab === 'GROUP' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Activity Coordination Group</h3>
              <p className="text-xs text-slate-500">Live WhatsApp-like communication channel for briefing and announcements.</p>
            </div>
            <Link
              to="/groups"
              className="px-4 py-2 bg-maatram-primary hover:bg-maatram-hover text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Open Group Messaging</span>
            </Link>
          </div>

          {group ? (
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-slate-900">{group.group_name}</h4>
                  <p className="text-xs text-slate-500">Channel Type: {group.group_type} • Created {group.created_at}</p>
                </div>
                <StatusBadge status={group.status} />
              </div>

              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recent Channel Activity:</p>
                <div className="space-y-2 text-xs">
                  {storage.getMessagesForGroup(group.group_id).slice(-3).map((msg) => (
                    <div key={msg.message_id} className="p-2.5 rounded bg-slate-50 border border-slate-100 flex items-start justify-between">
                      <div>
                        <span className="font-bold text-slate-800">{msg.sender_id === 'U011' ? 'Office Admin' : msg.sender_id}: </span>
                        <span className="text-slate-600">{msg.message_text}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">{msg.sent_at}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">No linked group found.</div>
          )}
        </div>
      )}

      {/* TAB 6: ATTENDANCE & HOURS */}
      {activeTab === 'ATTENDANCE' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-4 shadow-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Attendance Roster & Duration Audit</h3>
              <p className="text-xs text-slate-500">
                Mark Present / Absent / Excused, record check-in/out timestamps, and formally finalize verified hours.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Finalized Hours: {attendance.filter(a => a.verification_status === 'FINALIZED').reduce((sum, a) => sum + a.hours_verified, 0).toFixed(2)} hrs
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Volunteer</th>
                  <th className="px-4 py-3">Attendance Status</th>
                  <th className="px-4 py-3">Check-In / Out</th>
                  <th className="px-4 py-3">Calculated</th>
                  <th className="px-4 py-3">Verified Hours</th>
                  <th className="px-4 py-3">Verification</th>
                  <th className="px-4 py-3 text-right">Finalize Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approvedRegistrations.map((reg) => {
                  const volunteer = allUsers.find((u) => u.user_id === reg.user_id);
                  const att = attendance.find((a) => a.user_id === reg.user_id);

                  return (
                    <tr key={reg.user_id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900">{volunteer?.full_name}</p>
                        <p className="text-[11px] text-slate-500">{volunteer?.employer_org || volunteer?.department_or_batch}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1">
                          {(['PRESENT', 'ABSENT', 'EXCUSED'] as AttendanceStatus[]).map((status) => (
                            <button
                              key={status}
                              onClick={() => handleMarkAttendance(reg.user_id, status)}
                              className={clsx(
                                'px-2 py-0.5 rounded text-[10px] font-bold border transition-colors',
                                att?.attendance_status === status
                                  ? 'bg-maatram-primary text-white border-maatram-primary'
                                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                              )}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {att?.check_in ? `${att.check_in.split(' ')[1]} – ${att.check_out?.split(' ')[1]}` : '—'}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-700">
                        {att?.hours_calculated ? `${att.hours_calculated}h` : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-extrabold text-sm text-maatram-primary">
                          {att?.hours_verified || 0} hrs
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={att?.verification_status || 'NOT_FINALIZED'} type="verification" />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {att && att.verification_status !== 'FINALIZED' && att.attendance_status === 'PRESENT' && (
                          <button
                            onClick={() => handleFinalizeHours(att.attendance_id, att.hours_calculated || 4)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px]"
                          >
                            Finalize {att.hours_calculated || 4}h
                          </button>
                        )}
                        {att && att.verification_status === 'FINALIZED' && (
                          <span className="text-[11px] text-emerald-700 font-bold flex items-center justify-end gap-1">
                            <CheckCheck className="w-3.5 h-3.5" /> Finalized
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: CERTIFICATES */}
      {activeTab === 'CERTIFICATES' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-6 shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Certificate Generation & Controlled Issuance</h3>
              <p className="text-xs text-slate-500">
                Certificates are issued exclusively to attendees with finalized verified hours under Admin governance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Certificate Policy:</span>
              <span className={clsx(
                'text-xs font-bold px-2.5 py-0.5 rounded border',
                activity.certificate_enabled === 'Yes'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              )}>
                {activity.certificate_enabled === 'Yes' ? 'Enabled for Activity' : 'Disabled'}
              </span>
            </div>
          </div>

          {activity.certificate_enabled === 'No' ? (
            <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-200 text-xs text-slate-500">
              Certificates are disabled for this activity. You can enable them in Opportunity Settings.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Volunteer</th>
                    <th className="px-4 py-3">Attendance</th>
                    <th className="px-4 py-3">Verified Hours</th>
                    <th className="px-4 py-3">Certificate Number</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Issued On</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approvedRegistrations.map((reg) => {
                    const volunteer = allUsers.find((u) => u.user_id === reg.user_id);
                    const att = attendance.find((a) => a.user_id === reg.user_id);
                    const cert = certificates.find((c) => c.user_id === reg.user_id);

                    const isEligible = att?.verification_status === 'FINALIZED' && att?.attendance_status === 'PRESENT';

                    return (
                      <tr key={reg.user_id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-slate-900">{volunteer?.full_name}</p>
                          <p className="text-[11px] text-slate-500">{volunteer?.employer_org || volunteer?.department_or_batch}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={att?.attendance_status || 'PENDING'} />
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-800">
                          {att?.hours_verified || 0} hrs
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-600 font-semibold">
                          {cert?.certificate_number || '—'}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={cert?.issue_status || (isEligible ? 'ELIGIBLE' : 'NOT_ELIGIBLE')} />
                        </td>
                        <td className="px-4 py-3.5 text-slate-500">{cert?.issued_on || '—'}</td>
                        <td className="px-4 py-3.5 text-right space-x-2">
                          {cert?.issue_status === 'ISSUED' ? (
                            <button
                              onClick={() => setPreviewCertVolunteerId(reg.user_id)}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded border border-slate-300 inline-flex items-center gap-1"
                            >
                              <Award className="w-3 h-3 text-maatram-gold" />
                              <span>Preview Certificate</span>
                            </button>
                          ) : isEligible ? (
                            <button
                              onClick={() => handleIssueCertificate(reg.user_id)}
                              className="px-3 py-1 bg-maatram-primary hover:bg-maatram-hover text-white text-[11px] font-semibold rounded shadow-sm"
                            >
                              Generate & Issue
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Finalize hours first</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 8: REPORT & FINALIZATION */}
      {activeTab === 'REPORT' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-6 shadow-subtle">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-sm font-bold text-slate-900">Activity Finalization & Archival Report</h3>
            <p className="text-xs text-slate-500">
              Audit completeness checklist before marking activity as Completed and transitioning operational data to long-term archive.
            </p>
          </div>

          {/* Finalization Checklist */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Finalization Checklist</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                {pendingRegistrations.length === 0 ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500" />
                )}
                <span className={pendingRegistrations.length === 0 ? 'text-slate-800' : 'text-rose-700 font-bold'}>
                  {pendingRegistrations.length === 0
                    ? 'All applicant registrations reviewed and resolved'
                    : `${pendingRegistrations.length} registrations still pending approval`}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>
                  Attendance verified for {attendance.length} attendees ({attendance.filter(a => a.verification_status === 'FINALIZED').length} finalized)
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>
                  Certificate issuance: {certificates.filter(c => c.issue_status === 'ISSUED').length} generated
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Data retention hold: No active legal holds or disputed hours</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex gap-3">
              {activity.status !== 'COMPLETED' && activity.status !== 'ARCHIVED' && (
                <button
                  onClick={() => handleUpdateStatus('COMPLETED')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm"
                >
                  Mark Activity as COMPLETED
                </button>
              )}
              {activity.status === 'COMPLETED' && (
                <button
                  onClick={() => handleUpdateStatus('ARCHIVED')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Archive className="w-3.5 h-3.5 text-maatram-gold" />
                  <span>Archive Activity & Close Coordination Channels</span>
                </button>
              )}
            </div>
          </div>

          {/* Activity Report Snapshot Preview */}
          <div className="p-6 border border-slate-200 rounded-xl bg-white space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-maatram-primary">Official Impact Snapshot</p>
                <h4 className="text-base font-extrabold text-slate-900">{activity.title} — Executive Report</h4>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Confirmed Volunteers</span>
                <p className="text-lg font-bold text-slate-900 mt-1">{approvedRegistrations.length}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Total Verified Hours</span>
                <p className="text-lg font-bold text-maatram-primary mt-1">
                  {attendance.reduce((s, a) => s + (a.hours_verified || 0), 0)} hrs
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Attendance Rate</span>
                <p className="text-lg font-bold text-emerald-700 mt-1">
                  {approvedRegistrations.length > 0
                    ? `${Math.round((attendance.filter(a => a.attendance_status === 'PRESENT').length / approvedRegistrations.length) * 100)}%`
                    : '100%'}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Certificates Issued</span>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {certificates.filter(c => c.issue_status === 'ISSUED').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Professional Certificate Preview Modal */}
      {previewCertVolunteerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-elevated border border-slate-300 max-w-3xl w-full p-8 space-y-6 relative overflow-hidden">
            <button
              onClick={() => setPreviewCertVolunteerId(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>

            {/* Certificate Canvas */}
            <div className="border-8 border-double border-maatram-primary/40 p-8 rounded-xl bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 text-center space-y-6 relative shadow-inner">
              <div className="space-y-1">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-maatram-primary flex items-center justify-center text-maatram-gold">
                    <Award className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-widest text-maatram-primary">
                    MAATRAM FOUNDATION
                  </h2>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-maatram-gold-dark">
                  Certificate of Purposeful Volunteering & Community Contribution
                </p>
              </div>

              <div className="space-y-2 py-2">
                <p className="text-xs text-slate-500 italic">This is proudly presented to</p>
                <h3 className="text-2xl font-serif font-black text-slate-900 tracking-wide">
                  {allUsers.find(u => u.user_id === previewCertVolunteerId)?.full_name}
                </h3>
                <p className="text-xs text-slate-600 max-w-lg mx-auto">
                  in recognition of active service, mentorship, and certified dedication during{' '}
                  <strong className="text-slate-900">{activity.title}</strong> held on{' '}
                  <strong className="text-slate-900">{activity.start_date}</strong>.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-xs">
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Certificate Number</span>
                  <p className="font-mono font-bold text-slate-800">
                    {certificates.find(c => c.user_id === previewCertVolunteerId)?.certificate_number || 'M1-2026-0001'}
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Verification Code</span>
                  <p className="font-mono font-bold text-emerald-800">
                    {certificates.find(c => c.user_id === previewCertVolunteerId)?.verification_code || 'VERIFY-M1-0001'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Office Authority</span>
                  <p className="font-bold text-slate-800">{activity.coordinator}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewCertVolunteerId(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-maatram-primary hover:bg-maatram-hover text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Download Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
