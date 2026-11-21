import React, { useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Users, 
  Calendar, 
  Clock, 
  Award, 
  MessageSquare, 
  FileCheck2, 
  AlertTriangle, 
  TrendingUp, 
  Briefcase, 
  Filter, 
  ArrowRight, 
  CheckCircle, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const storage = useStorage();
  const kpis = storage.getDashboardKPIs();

  // Multi-criteria Filter Bar
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterEmployer, setFilterEmployer] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const users = storage.getUsers();
  const activities = storage.getActivities();
  const categories = storage.getCategories();
  const registrations = storage.getRegistrations();
  const attendance = storage.getAttendance();
  const certificates = storage.getCertificates();

  // Role Breakdown
  const studentCount = users.filter((u) => u.role === 'STUDENT' && u.account_status === 'ACTIVE').length;
  const alumniCount = users.filter((u) => u.role === 'ALUMNI' && u.account_status === 'ACTIVE').length;
  const supporterCount = users.filter((u) => u.role === 'SUPPORTER' && u.account_status === 'ACTIVE').length;

  // Inactive volunteers needing review (e.g. U010 Vignesh R)
  const inactiveReviewUsers = users.filter((u) => u.account_status === 'INACTIVE_REVIEW');

  // Pending Approvals Queue
  const pendingRegistrationsList = registrations.filter((r) => r.status === 'PENDING');

  // Chart Data: Category-wise Participation
  const categoryParticipationData = categories.map((cat) => {
    const actIds = activities.filter((a) => a.category_id === cat.category_id).map((a) => a.activity_id);
    const regs = registrations.filter((r) => actIds.includes(r.activity_id)).length;
    const hours = attendance
      .filter((a) => actIds.includes(a.activity_id) && a.verification_status === 'FINALIZED')
      .reduce((sum, item) => sum + item.hours_verified, 0);

    return {
      name: cat.category_name.length > 15 ? cat.category_name.slice(0, 14) + '...' : cat.category_name,
      fullName: cat.category_name,
      registrations: regs,
      hours: Number(hours.toFixed(1)),
    };
  });

  // Chart Data: Employer-wise Contribution (Alumni)
  const employerMap = new Map<string, number>();
  attendance
    .filter((a) => a.verification_status === 'FINALIZED')
    .forEach((a) => {
      const user = users.find((u) => u.user_id === a.user_id);
      if (user && user.employer_org) {
        const curr = employerMap.get(user.employer_org) || 0;
        employerMap.set(user.employer_org, curr + a.hours_verified);
      }
    });

  const employerData = Array.from(employerMap.entries()).map(([org, hrs]) => ({
    name: org,
    hours: Number(hrs.toFixed(1)),
  }));

  // Chart Data: Role Distribution
  const roleDistributionData = [
    { name: 'Students', value: studentCount, color: '#174B38' },
    { name: 'Alumni', value: alumniCount, color: '#2563EB' },
    { name: 'Supporters', value: supporterCount, color: '#D5A03E' },
  ];

  // Unique Employers
  const uniqueEmployers = Array.from(new Set(users.map((u) => u.employer_org).filter(Boolean)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-maatram-primary mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Central Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Platform Operations & Impact Overview
          </h1>
          <p className="text-xs text-slate-500">
            Real-time monitoring across volunteer onboarding, opportunity lifecycle, attendance audit, and certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/reports"
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-subtle flex items-center gap-1.5 transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5 text-maatram-primary" />
            <span>Reports & Exports</span>
          </Link>
          <Link
            to="/admin/opportunities"
            className="px-4 py-2 bg-maatram-primary hover:bg-maatram-hover text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-maatram-gold" />
            <span>Manage Activities</span>
          </Link>
        </div>
      </div>

      {/* 9 Canonical Demo KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Total Volunteers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Total Volunteers
          </span>
          <p className="text-2xl font-extrabold text-slate-900">{kpis.total_volunteers}</p>
          <p className="text-[11px] text-slate-500">
            {studentCount} Students • {alumniCount} Alumni • {supporterCount} Supporters
          </p>
        </div>

        {/* 2. Active Opportunities */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Active Opportunities
          </span>
          <p className="text-2xl font-extrabold text-maatram-primary">{kpis.active_opportunities}</p>
          <p className="text-[11px] text-slate-500">Published or In Progress</p>
        </div>

        {/* 3. Pending Registrations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Pending Approvals
          </span>
          <p className="text-2xl font-extrabold text-amber-700">{kpis.pending_registrations}</p>
          <p className="text-[11px] text-slate-500">{kpis.waitlisted_registrations} on waitlist</p>
        </div>

        {/* 4. Verified Volunteer Hours */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Verified Hours
          </span>
          <p className="text-2xl font-extrabold text-emerald-800">{kpis.verified_volunteer_hours} hrs</p>
          <p className="text-[11px] text-slate-500 font-semibold">Strictly Finalized records</p>
        </div>

        {/* 5. Certificates Issued */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Certificates Issued
          </span>
          <p className="text-2xl font-extrabold text-slate-900">{kpis.certificates_issued}</p>
          <p className="text-[11px] text-slate-500">With verification codes</p>
        </div>

        {/* 6. Completed Activities */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Completed Activities
          </span>
          <p className="text-2xl font-extrabold text-slate-900">{kpis.completed_activities}</p>
          <p className="text-[11px] text-slate-500">Archived & Finalized</p>
        </div>

        {/* 7. Active Groups */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Active Groups
          </span>
          <p className="text-2xl font-extrabold text-slate-900">{kpis.active_volunteer_groups}</p>
          <p className="text-[11px] text-slate-500">Live communication</p>
        </div>

        {/* 8. Volunteers Requiring Inactivity Review */}
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/40 shadow-subtle space-y-1 sm:col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-rose-800 tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Inactivity Review Required
            </span>
            <Link
              to="/admin/volunteers"
              className="text-[11px] font-bold text-rose-700 hover:underline flex items-center gap-1"
            >
              <span>Review Volunteers</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-2xl font-extrabold text-rose-900">
            {kpis.volunteers_requiring_inactivity_review} Volunteer Profile
          </p>
          <p className="text-[11px] text-rose-800">
            1 volunteer flagged (Vignesh R - Freshworks) with zero active registrations across recent quarters.
          </p>
        </div>
      </div>

      {/* Multi-criteria Drill-down Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle space-y-2 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-maatram-primary" />
            Dashboard Drill-Down Filters
          </span>
          <button
            onClick={() => {
              setFilterRole('ALL');
              setFilterCategory('ALL');
              setFilterEmployer('ALL');
              setFilterStatus('ALL');
            }}
            className="text-[11px] font-semibold text-rose-600 hover:underline"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Volunteer Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">STUDENT</option>
              <option value="ALUMNI">ALUMNI</option>
              <option value="SUPPORTER">SUPPORTER</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Activity Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700"
            >
              <option value="ALL">All 5 Categories</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Employer Partner</label>
            <select
              value={filterEmployer}
              onChange={(e) => setFilterEmployer(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700"
            >
              <option value="ALL">All Employers</option>
              {uniqueEmployers.map((emp) => (
                <option key={emp as string} value={emp as string}>
                  {emp as string}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Activity Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analytics Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category-wise Registrations & Hours BarChart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Category-Wise Engagement & Hours</h3>
              <p className="text-xs text-slate-500">Distribution across 5 core volunteering pillars</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">All Time</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryParticipationData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18332A', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="registrations" name="Registrations" fill="#174B38" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hours" name="Verified Hours" fill="#D5A03E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employer-wise Alumni Contributions */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Employer-Wise Alumni Contribution</h3>
              <p className="text-xs text-slate-500">Finalized volunteering hours by corporate organization</p>
            </div>
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employerData} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} unit="h" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 600 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18332A', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="hours" name="Verified Hours" fill="#2563EB" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two-Column Work Queues: Pending Approvals & Upcoming Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals Queue */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-amber-600" />
                <span>Pending Approval Queue ({pendingRegistrationsList.length})</span>
              </h3>
              <p className="text-xs text-slate-500">Applications requiring capacity confirmation</p>
            </div>
            <Link to="/admin/registrations" className="text-xs font-bold text-maatram-primary hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {pendingRegistrationsList.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No pending applications</p>
            ) : (
              pendingRegistrationsList.map((reg) => {
                const applicant = users.find((u) => u.user_id === reg.user_id);
                const act = activities.find((a) => a.activity_id === reg.activity_id);

                return (
                  <div key={reg.registration_id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{applicant?.full_name}</p>
                      <p className="text-[11px] text-slate-500">
                        {applicant?.role} • {act?.title}
                      </p>
                      <span className="text-[10px] text-slate-400">Applied: {reg.applied_at}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => storage.updateRegistrationStatus(reg.registration_id, 'APPROVED')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px]"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => storage.updateRegistrationStatus(reg.registration_id, 'WAITLISTED')}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded text-[11px]"
                      >
                        Waitlist
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live / Upcoming Activities */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-maatram-primary" />
                <span>Active & Upcoming Opportunities</span>
              </h3>
              <p className="text-xs text-slate-500">Current volunteer operations</p>
            </div>
            <Link to="/admin/opportunities" className="text-xs font-bold text-maatram-primary hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {activities.slice(0, 4).map((act) => {
              const approvedCount = storage.getRegistrationsForActivity(act.activity_id).filter(r => r.status === 'APPROVED').length;
              return (
                <div key={act.activity_id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{act.title}</span>
                      <StatusBadge status={act.status} type="activity" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {act.start_date} • {act.location} ({act.mode})
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Capacity: {approvedCount} / {act.capacity} filled
                    </p>
                  </div>
                  <Link
                    to={`/admin/activities/${act.activity_id}`}
                    className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700"
                    title="Open 8-Tab Activity Hub"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
