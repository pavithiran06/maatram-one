import React, { useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { RegistrationStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  UserCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Calendar,
  Building,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export const RegistrationManagementPage: React.FC = () => {
  const storage = useStorage();
  const [activeFilter, setActiveFilter] = useState<'ALL' | RegistrationStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('ALL');
  const [toast, setToast] = useState<string | null>(null);

  const registrations = storage.getRegistrations();
  const activities = storage.getActivities();
  const users = storage.getUsers();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = (regId: string, newStatus: RegistrationStatus, note?: string) => {
    storage.updateRegistrationStatus(regId, newStatus, note);
    showToast(`Registration ${regId} updated to ${newStatus}`);
  };

  // Filter pipeline
  const filteredRegistrations = registrations.filter((reg) => {
    if (activeFilter !== 'ALL' && reg.status !== activeFilter) return false;
    if (selectedActivityId !== 'ALL' && reg.activity_id !== selectedActivityId) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const applicant = users.find((u) => u.user_id === reg.user_id);
      const act = activities.find((a) => a.activity_id === reg.activity_id);
      const matchName = applicant?.full_name.toLowerCase().includes(q);
      const matchAct = act?.title.toLowerCase().includes(q);
      const matchId = reg.registration_id.toLowerCase().includes(q);
      if (!matchName && !matchAct && !matchId) return false;
    }

    return true;
  });

  const countPending = registrations.filter((r) => r.status === 'PENDING').length;
  const countApproved = registrations.filter((r) => r.status === 'APPROVED').length;
  const countWaitlisted = registrations.filter((r) => r.status === 'WAITLISTED').length;
  const countRejected = registrations.filter((r) => r.status === 'REJECTED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top duration-200">
          <div className="bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-elevated border border-emerald-700 flex items-center space-x-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-maatram-primary mb-1">
            <UserCheck className="w-4 h-4" />
            <span>Registration Governance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Volunteer Registration Approvals</h1>
          <p className="text-xs text-slate-500">
            Review pending applications, confirm allocations, manage waitlists, and maintain capacity thresholds.
          </p>
        </div>
      </div>

      {/* Quick Status Count Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <button
          onClick={() => setActiveFilter('PENDING')}
          className={clsx(
            'p-3.5 rounded-xl border text-left transition-all',
            activeFilter === 'PENDING'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          )}
        >
          <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Pending Review</span>
          <p className="text-xl font-extrabold text-amber-900 mt-0.5">{countPending}</p>
        </button>

        <button
          onClick={() => setActiveFilter('APPROVED')}
          className={clsx(
            'p-3.5 rounded-xl border text-left transition-all',
            activeFilter === 'APPROVED'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          )}
        >
          <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Approved</span>
          <p className="text-xl font-extrabold text-emerald-900 mt-0.5">{countApproved}</p>
        </button>

        <button
          onClick={() => setActiveFilter('WAITLISTED')}
          className={clsx(
            'p-3.5 rounded-xl border text-left transition-all',
            activeFilter === 'WAITLISTED'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          )}
        >
          <span className="text-[10px] text-blue-800 font-bold uppercase tracking-wider">Waitlisted</span>
          <p className="text-xl font-extrabold text-blue-900 mt-0.5">{countWaitlisted}</p>
        </button>

        <button
          onClick={() => setActiveFilter('ALL')}
          className={clsx(
            'p-3.5 rounded-xl border text-left transition-all',
            activeFilter === 'ALL'
              ? 'bg-slate-100 border-slate-300 ring-2 ring-slate-400 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          )}
        >
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Applications</span>
          <p className="text-xl font-extrabold text-slate-800 mt-0.5">{registrations.length}</p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search applicant or activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-maatram-primary"
          />
        </div>

        <div>
          <select
            value={selectedActivityId}
            onChange={(e) => setSelectedActivityId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-maatram-primary"
          >
            <option value="ALL">All Activities</option>
            {activities.map((a) => (
              <option key={a.activity_id} value={a.activity_id}>
                {a.title} ({a.activity_id})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end">
          {activeFilter !== 'ALL' && (
            <button
              onClick={() => setActiveFilter('ALL')}
              className="text-xs font-semibold text-rose-600 hover:underline px-3 py-1.5 bg-rose-50 rounded"
            >
              Clear Status Filter ({activeFilter})
            </button>
          )}
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Registration ID</th>
                <th className="px-5 py-3">Volunteer Applicant</th>
                <th className="px-5 py-3">Target Opportunity</th>
                <th className="px-5 py-3">Applied At</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Review Details</th>
                <th className="px-5 py-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRegistrations.map((reg) => {
                const applicant = users.find((u) => u.user_id === reg.user_id);
                const act = activities.find((a) => a.activity_id === reg.activity_id);

                return (
                  <tr key={reg.registration_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-500 font-medium">
                      {reg.registration_id}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-start space-x-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 flex-shrink-0 text-xs">
                          {applicant?.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{applicant?.full_name}</p>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                            {applicant?.role}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {applicant?.employer_org || applicant?.department_or_batch}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/admin/activities/${reg.activity_id}`}
                        className="font-bold text-slate-900 hover:text-maatram-primary transition-colors block"
                      >
                        {act?.title || reg.activity_id}
                      </Link>
                      <p className="text-[11px] text-slate-500">
                        {act?.start_date} • {act?.mode}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{reg.applied_at}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={reg.status} type="registration" />
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {reg.reviewed_by ? (
                        <div>
                          <p className="text-[11px] font-semibold text-slate-800">
                            Reviewed by {reg.reviewed_by}
                          </p>
                          <p className="text-[10px] text-slate-400">{reg.reviewed_at}</p>
                          {reg.admin_note && (
                            <p className="text-[11px] text-slate-600 italic mt-0.5">"{reg.admin_note}"</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Pending initial review</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {reg.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleStatusChange(reg.registration_id, 'APPROVED', 'Approved by Admin')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px]"
                        >
                          Approve
                        </button>
                      )}
                      {reg.status !== 'WAITLISTED' && (
                        <button
                          onClick={() => handleStatusChange(reg.registration_id, 'WAITLISTED', 'Moved to waitlist')}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded text-[11px]"
                        >
                          Waitlist
                        </button>
                      )}
                      {reg.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleStatusChange(reg.registration_id, 'REJECTED', 'Capacity reached')}
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
    </div>
  );
};
