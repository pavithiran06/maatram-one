import React, { useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { StatusBadge } from '../../components/common/StatusBadge';
import { User, UserRole, AccountStatus } from '../../types';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Briefcase, 
  GraduationCap, 
  Mail, 
  Phone, 
  Clock, 
  Award,
  ShieldCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export const VolunteerDirectoryPage: React.FC = () => {
  const storage = useStorage();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AccountStatus>('ALL');
  const [toast, setToast] = useState<string | null>(null);

  const users = storage.getUsers().filter((u) => u.role !== 'ADMIN');
  const attendance = storage.getAttendance();
  const registrations = storage.getRegistrations();
  const certificates = storage.getCertificates();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateStatus = (user: User, newStatus: AccountStatus) => {
    storage.updateUser({ ...user, account_status: newStatus });
    showToast(`Volunteer ${user.full_name} status updated to ${newStatus}`);
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (statusFilter !== 'ALL' && u.account_status !== statusFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = u.full_name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchAffil = (u.employer_org || u.department_or_batch || '').toLowerCase().includes(q);
      const matchSkills = (u.skills || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchAffil && !matchSkills) return false;
    }

    return true;
  });

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
            <Users className="w-4 h-4" />
            <span>Community Registry</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Volunteer Management & Inactivity Review</h1>
          <p className="text-xs text-slate-500">
            Profiles, academic background, employer attribution, verified contributions, and engagement health.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search volunteers by name, skill, company, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-maatram-primary"
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-maatram-primary text-slate-700"
          >
            <option value="ALL">All Roles (Students, Alumni, Supporters)</option>
            <option value="STUDENT">STUDENT</option>
            <option value="ALUMNI">ALUMNI</option>
            <option value="SUPPORTER">SUPPORTER</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-maatram-primary text-slate-700"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE_REVIEW">INACTIVE_REVIEW (Action Required)</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>
      </div>

      {/* Volunteer Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((user) => {
          const userHours = attendance
            .filter((a) => a.user_id === user.user_id && a.verification_status === 'FINALIZED')
            .reduce((sum, a) => sum + (Number(a.hours_verified) || 0), 0);
          const userRegs = registrations.filter((r) => r.user_id === user.user_id).length;
          const userCerts = certificates.filter((c) => c.user_id === user.user_id && c.issue_status === 'ISSUED').length;
          const pref = storage.getPreferencesForUser(user.user_id);
          const isDnc = pref.volunteer_dnc === 'Yes' || pref.admin_dnc === 'Yes';

          return (
            <div
              key={user.user_id}
              className={clsx(
                'bg-white rounded-xl border p-5 flex flex-col justify-between shadow-subtle hover:shadow-card transition-all',
                user.account_status === 'INACTIVE_REVIEW'
                  ? 'border-rose-300 bg-rose-50/20'
                  : 'border-slate-200/90'
              )}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-maatram-primary/10 text-maatram-primary font-bold text-sm flex items-center justify-center flex-shrink-0 border border-maatram-primary/20">
                      {user.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{user.full_name}</h3>
                      <p className="text-[11px] font-mono text-slate-400">ID: {user.user_id}</p>
                    </div>
                  </div>
                  <StatusBadge status={user.account_status} />
                </div>

                {/* Role & Affiliation */}
                <div className="text-xs space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Category:</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                      {user.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Affiliation:</span>
                    <span className="font-semibold text-slate-900 text-right truncate max-w-[170px]">
                      {user.employer_org || user.department_or_batch}
                    </span>
                  </div>
                  {user.graduation_year && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Graduation Year:</span>
                      <span className="font-semibold text-slate-800">{user.graduation_year}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Volunteer Since:</span>
                    <span className="text-slate-700">{user.volunteer_since}</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Skills & Focus:</span>
                  <p className="text-slate-700 leading-snug">{user.skills}</p>
                </div>

                {/* Stats Ribbon */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-base font-extrabold text-maatram-primary">{userHours.toFixed(1)}h</p>
                    <p className="text-[9px] uppercase font-bold text-slate-400">Hours</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-base font-extrabold text-slate-800">{userRegs}</p>
                    <p className="text-[9px] uppercase font-bold text-slate-400">Activities</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-base font-extrabold text-slate-800">{userCerts}</p>
                    <p className="text-[9px] uppercase font-bold text-slate-400">Certs</p>
                  </div>
                </div>
              </div>

              {/* Inactivity & DNC Actions */}
              <div className="pt-4 border-t border-slate-100 space-y-2 mt-4 text-xs">
                {isDnc && (
                  <div className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded border border-rose-200 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-rose-600 flex-shrink-0" />
                    <span>DNC Restriction Active ({pref.dnc_reason || 'Blocked'})</span>
                  </div>
                )}

                <div className="flex gap-2">
                  {user.account_status === 'INACTIVE_REVIEW' ? (
                    <button
                      onClick={() => handleUpdateStatus(user, 'ACTIVE')}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs shadow-sm transition-colors"
                    >
                      Clear Inactivity & Reactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(user, 'INACTIVE_REVIEW')}
                      className="w-full py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 font-semibold rounded text-xs transition-colors"
                    >
                      Flag for Inactivity Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
