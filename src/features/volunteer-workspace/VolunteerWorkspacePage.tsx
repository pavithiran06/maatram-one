import React, { useState } from 'react';
import { useStorage, useCurrentUser } from '../../hooks/useStorage';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AvailabilityResponseType, InvitationStatus } from '../../types';
import { 
  UserCheck, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Award, 
  MessageSquare, 
  ArrowRight,
  Briefcase,
  GraduationCap,
  Sparkles,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export const VolunteerWorkspacePage: React.FC = () => {
  const storage = useStorage();
  const [currentUser] = useCurrentUser();
  const [activeTab, setActiveTab] = useState<'REGISTRATIONS' | 'AVAILABILITY' | 'HOURS' | 'GROUPS'>('REGISTRATIONS');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const activities = storage.getActivities();
  const categories = storage.getCategories();
  const userRegistrations = storage.getRegistrationsForUser(currentUser.user_id);
  const userAvailability = storage.getAvailabilityForUser(currentUser.user_id);
  const userAttendance = storage.getAttendanceForUser(currentUser.user_id);
  const userCertificates = storage.getCertificatesForUser(currentUser.user_id);

  // Groups user is part of (groups linked to activities where user is registered/approved or in attendance)
  const approvedActivityIds = userRegistrations
    .filter(r => r.status === 'APPROVED' || r.status === 'COMPLETED')
    .map(r => r.activity_id);
  const userGroups = storage.getGroups().filter(g => approvedActivityIds.includes(g.activity_id));

  // Verified Hours calculation
  const totalVerifiedHours = userAttendance
    .filter(a => a.verification_status === 'FINALIZED')
    .reduce((sum, item) => sum + (Number(item.hours_verified) || 0), 0);

  const handleRespondAvailability = (responseId: string, response: AvailabilityResponseType) => {
    storage.respondAvailability(responseId, response);
    setToastMsg(`Availability marked as ${response}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleInvitationAction = (responseId: string, status: InvitationStatus) => {
    storage.updateInvitationStatus(responseId, status);
    setToastMsg(
      status === 'CONFIRMED'
        ? 'Invitation accepted! Note: Final participation confirmation is recorded by Admin.'
        : 'Invitation declined.'
    );
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top duration-200">
          <div className="bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-elevated border border-emerald-700 flex items-center space-x-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Volunteer Profile Header Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-maatram-primary text-white font-extrabold text-xl flex items-center justify-center shadow-card flex-shrink-0">
            {currentUser.full_name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-bold text-slate-900">{currentUser.full_name}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {currentUser.role}
              </span>
              <span className="text-xs font-mono text-slate-400">ID: {currentUser.user_id}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {currentUser.employer_org ? (
                <span className="flex items-center gap-1 text-slate-700">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  {currentUser.employer_org} (Alumni Batch of {currentUser.graduation_year})
                </span>
              ) : (
                <span className="flex items-center gap-1 text-slate-700">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  {currentUser.department_or_batch} • Active Scholar
                </span>
              )}
            </p>
            <p className="text-[11px] text-slate-400">
              Volunteering with Maatram since {currentUser.volunteer_since} • Skills: {currentUser.skills}
            </p>
          </div>
        </div>

        {/* Quick Summary Badges */}
        <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
          <div className="text-center px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-lg font-extrabold text-maatram-primary">{totalVerifiedHours.toFixed(1)} hrs</p>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Finalized Hours</p>
          </div>
          <div className="text-center px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-lg font-extrabold text-slate-900">{userRegistrations.length}</p>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Registrations</p>
          </div>
          <div className="text-center px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-lg font-extrabold text-maatram-gold-dark">{userCertificates.filter(c => c.issue_status === 'ISSUED').length}</p>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Certificates</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 text-xs font-bold" aria-label="Tabs">
          {[
            { id: 'REGISTRATIONS', label: `My Registrations (${userRegistrations.length})`, icon: UserCheck },
            { id: 'AVAILABILITY', label: `Availability & Invitations (${userAvailability.length})`, icon: Clock },
            { id: 'HOURS', label: `Verified Hours (${userAttendance.length})`, icon: FileCheck },
            { id: 'GROUPS', label: `My Groups (${userGroups.length})`, icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  'py-3 border-b-2 font-semibold flex items-center space-x-2 transition-colors',
                  isActive
                    ? 'border-maatram-primary text-maatram-primary font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                )}
              >
                <Icon className={clsx('w-4 h-4', isActive ? 'text-maatram-primary' : 'text-slate-400')} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB CONTENT */}

      {/* Tab 1: Registrations */}
      {activeTab === 'REGISTRATIONS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Track all applications and admin review outcomes.</p>
            <Link
              to="/opportunities"
              className="px-3.5 py-1.5 bg-maatram-primary hover:bg-maatram-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>Browse New Opportunities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {userRegistrations.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center border border-slate-200 space-y-2">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No registrations found</p>
              <p className="text-xs text-slate-500">Explore open opportunities and submit your first registration!</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-5 py-3">Registration ID</th>
                      <th className="px-5 py-3">Activity</th>
                      <th className="px-5 py-3">Schedule</th>
                      <th className="px-5 py-3">Applied At</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Admin Note</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {userRegistrations.map((reg) => {
                      const act = activities.find(a => a.activity_id === reg.activity_id);
                      return (
                        <tr key={reg.registration_id} className="hover:bg-slate-50/70">
                          <td className="px-5 py-3.5 font-mono text-slate-500 font-medium">
                            {reg.registration_id}
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-slate-900">{act?.title || reg.activity_id}</p>
                            <p className="text-[11px] text-slate-500">{act?.location} • {act?.mode}</p>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {act ? `${act.start_date} (${act.start_time})` : '—'}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">{reg.applied_at}</td>
                          <td className="px-5 py-3.5">
                            <StatusBadge status={reg.status} type="registration" />
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 italic">
                            {reg.admin_note || '—'}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            {reg.status === 'APPROVED' && (
                              <Link
                                to="/groups"
                                className="inline-flex items-center gap-1 text-xs font-bold text-maatram-primary hover:underline"
                              >
                                <span>Go to Group</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
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
        </div>
      )}

      {/* Tab 2: Availability & Invitations */}
      {activeTab === 'AVAILABILITY' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Participation Rule:</strong> Responding <em>Available</em> or accepting an invitation lets the Office Admin know you are ready. As per organizational policy, final confirmation is issued by Admin once team composition is balanced.
            </div>
          </div>

          {userAvailability.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center border border-slate-200 space-y-2">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No active availability requests</p>
              <p className="text-xs text-slate-500">When Admin requests your availability for upcoming slots, they will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userAvailability.map((avail) => {
                const act = activities.find(a => a.activity_id === avail.activity_id);
                return (
                  <div key={avail.response_id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-subtle">
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400">Request ID: {avail.response_id}</span>
                        <h3 className="font-bold text-sm text-slate-900">{act?.title || avail.activity_id}</h3>
                        <p className="text-xs text-slate-500">{act?.start_date} • {act?.location} ({act?.mode})</p>
                      </div>
                      <StatusBadge status={avail.response} type="availability" />
                    </div>

                    <div className="text-xs space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Requested On:</span>
                        <span className="font-medium text-slate-800">{avail.request_sent_at}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">My Response:</span>
                        <span className="font-bold text-slate-900">{avail.response}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Invitation Status:</span>
                        <StatusBadge status={avail.invitation_status} type="invitation" />
                      </div>
                    </div>

                    {/* Interactive Response buttons */}
                    <div className="space-y-2 pt-1">
                      <p className="text-[11px] font-bold text-slate-700">Update Your Availability:</p>
                      <div className="flex gap-2">
                        {(['AVAILABLE', 'MAYBE', 'UNAVAILABLE'] as AvailabilityResponseType[]).map((resp) => (
                          <button
                            key={resp}
                            onClick={() => handleRespondAvailability(avail.response_id, resp)}
                            className={clsx(
                              'flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center',
                              avail.response === resp
                                ? 'bg-maatram-primary text-white border-maatram-primary shadow-sm'
                                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                            )}
                          >
                            {resp}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Invitation Response */}
                    {avail.invitation_status === 'SENT' && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                        <p className="text-xs font-bold text-blue-900">You have been selected & invited to participate!</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleInvitationAction(avail.response_id, 'CONFIRMED')}
                            className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded"
                          >
                            Accept Invitation
                          </button>
                          <button
                            onClick={() => handleInvitationAction(avail.response_id, 'DECLINED')}
                            className="flex-1 py-1.5 bg-white text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs font-semibold rounded"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Verified Hours */}
      {activeTab === 'HOURS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Only records marked as <strong>FINALIZED</strong> by Admin count towards verified contribution records and certificates.
            </p>
            <span className="text-xs font-bold text-maatram-primary bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Total Verified: {totalVerifiedHours.toFixed(2)} Hours
            </span>
          </div>

          {userAttendance.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center border border-slate-200 space-y-2">
              <FileCheck className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No attendance records yet</p>
              <p className="text-xs text-slate-500">Attendance and verified hours will appear once you attend your assigned sessions.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3">Record ID</th>
                    <th className="px-5 py-3">Activity</th>
                    <th className="px-5 py-3">Attendance</th>
                    <th className="px-5 py-3">Check-In / Out</th>
                    <th className="px-5 py-3">Calculated</th>
                    <th className="px-5 py-3">Verified Hours</th>
                    <th className="px-5 py-3">Verification</th>
                    <th className="px-5 py-3">Verified By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userAttendance.map((item) => {
                    const act = activities.find(a => a.activity_id === item.activity_id);
                    return (
                      <tr key={item.attendance_id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-3.5 font-mono text-slate-500">{item.attendance_id}</td>
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-900">{act?.title || item.activity_id}</p>
                          <p className="text-[11px] text-slate-500">{act?.start_date}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={item.attendance_status} />
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {item.check_in ? `${item.check_in.split(' ')[1]} – ${item.check_out?.split(' ')[1]}` : '—'}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-600">
                          {item.hours_calculated > 0 ? `${item.hours_calculated}h` : '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-extrabold text-sm text-maatram-primary">
                            {item.hours_verified} hrs
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={item.verification_status} type="verification" />
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-500">
                          {item.verified_by || '—'}
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

      {/* Tab 4: Groups */}
      {activeTab === 'GROUPS' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Activity-linked groups you are authorized to participate in.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userGroups.map((group) => {
              const act = activities.find(a => a.activity_id === group.activity_id);
              const msgs = storage.getMessagesForGroup(group.group_id);
              const pinnedCount = msgs.filter(m => m.pinned === 'Yes').length;

              return (
                <div key={group.group_id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-subtle hover:border-maatram-primary/40 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">{group.group_id} • {group.group_type}</span>
                      <h3 className="font-bold text-sm text-slate-900">{group.group_name}</h3>
                      <p className="text-xs text-slate-500">{act?.start_date} • {act?.location}</p>
                    </div>
                    <StatusBadge status={group.status} />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      {msgs.length} messages
                    </span>
                    {pinnedCount > 0 && (
                      <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                        {pinnedCount} Pinned Announcement{pinnedCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="pt-2">
                    <Link
                      to="/groups"
                      className="w-full py-2 bg-slate-50 hover:bg-emerald-50 text-maatram-primary hover:text-maatram-hover border border-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Open WhatsApp-Style Chat</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
