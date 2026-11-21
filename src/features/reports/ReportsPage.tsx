import React, { useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  Users, 
  Award, 
  Briefcase, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  AlertTriangle,
  Building,
  GraduationCap
} from 'lucide-react';
import clsx from 'clsx';

export const ReportsPage: React.FC = () => {
  const storage = useStorage();
  const [activeReport, setActiveReport] = useState<
    'ACTIVITIES' | 'VOLUNTEERS' | 'ALUMNI_EMPLOYERS' | 'INACTIVITY' | 'CERTIFICATES'
  >('ACTIVITIES');

  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const users = storage.getUsers();
  const activities = storage.getActivities();
  const categories = storage.getCategories();
  const attendance = storage.getAttendance();
  const certificates = storage.getCertificates();
  const registrations = storage.getRegistrations();

  // Helper for CSV download
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map(item => `"${String(item).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Activity Performance Report
  const activityReportRows = activities.map((act) => {
    const cat = categories.find((c) => c.category_id === act.category_id);
    const regs = registrations.filter((r) => r.activity_id === act.activity_id);
    const approved = regs.filter((r) => r.status === 'APPROVED').length;
    const attList = attendance.filter((a) => a.activity_id === act.activity_id);
    const hours = attList.reduce((sum, a) => sum + (a.hours_verified || 0), 0);
    const certCount = certificates.filter((c) => c.activity_id === act.activity_id && c.issue_status === 'ISSUED').length;

    return {
      activity_id: act.activity_id,
      title: act.title,
      category: cat?.category_name || act.category_id,
      start_date: act.start_date,
      mode: act.mode,
      capacity: act.capacity,
      approved_volunteers: approved,
      attendance_count: attList.length,
      verified_hours: hours,
      certificates_issued: certCount,
      status: act.status,
    };
  });

  // 2. Volunteer Contribution Report
  const volunteerReportRows = users
    .filter((u) => u.role !== 'ADMIN')
    .filter((u) => (roleFilter === 'ALL' ? true : u.role === roleFilter))
    .map((u) => {
      const uRegs = registrations.filter((r) => r.user_id === u.user_id);
      const uAtt = attendance.filter((a) => a.user_id === u.user_id && a.verification_status === 'FINALIZED');
      const totalHours = uAtt.reduce((sum, a) => sum + a.hours_verified, 0);
      const uCerts = certificates.filter((c) => c.user_id === u.user_id && c.issue_status === 'ISSUED').length;

      return {
        user_id: u.user_id,
        name: u.full_name,
        role: u.role,
        department_or_employer: u.employer_org || u.department_or_batch,
        volunteer_since: u.volunteer_since,
        registrations_count: uRegs.length,
        verified_hours: totalHours,
        certificates_count: uCerts,
        account_status: u.account_status,
      };
    });

  // 3. Employer-wise Summary
  const employerSummaryRows = Array.from(new Set(users.map((u) => u.employer_org).filter(Boolean))).map((emp) => {
    const alumniList = users.filter((u) => u.employer_org === emp);
    const userIds = alumniList.map((u) => u.user_id);
    const hours = attendance
      .filter((a) => userIds.includes(a.user_id) && a.verification_status === 'FINALIZED')
      .reduce((sum, a) => sum + a.hours_verified, 0);

    return {
      employer: emp as string,
      alumni_count: alumniList.length,
      verified_hours: Number(hours.toFixed(2)),
      consistency_rating: hours > 5 ? 'Consistent' : 'Moderate',
    };
  });

  // 4. Inactive Volunteers Analysis
  const inactiveRows = users.filter((u) => u.account_status === 'INACTIVE_REVIEW');

  // Export Dispatcher
  const handleExportCurrent = () => {
    const today = new Date().toISOString().split('T')[0];
    if (activeReport === 'ACTIVITIES') {
      const headers = ['Activity ID', 'Title', 'Category', 'Date', 'Mode', 'Capacity', 'Approved', 'Attendees', 'Verified Hours', 'Certs', 'Status'];
      const data = activityReportRows.map(r => [
        r.activity_id, r.title, r.category, r.start_date, r.mode, r.capacity, r.approved_volunteers, r.attendance_count, r.verified_hours, r.certificates_issued, r.status
      ]);
      downloadCSV(`maatram_activity_performance_${today}.csv`, headers, data);
    } else if (activeReport === 'VOLUNTEERS') {
      const headers = ['User ID', 'Full Name', 'Role', 'Affiliation', 'Volunteer Since', 'Registrations', 'Verified Hours', 'Certificates', 'Status'];
      const data = volunteerReportRows.map(r => [
        r.user_id, r.name, r.role, r.department_or_employer, r.volunteer_since, r.registrations_count, r.verified_hours, r.certificates_count, r.account_status
      ]);
      downloadCSV(`maatram_volunteer_contributions_${today}.csv`, headers, data);
    } else if (activeReport === 'ALUMNI_EMPLOYERS') {
      const headers = ['Employer Organization', 'Alumni Volunteers', 'Verified Hours Contributed', 'Consistency Rating'];
      const data = employerSummaryRows.map(r => [r.employer, r.alumni_count, r.verified_hours, r.consistency_rating]);
      downloadCSV(`maatram_employer_contributions_${today}.csv`, headers, data);
    } else if (activeReport === 'INACTIVITY') {
      const headers = ['User ID', 'Full Name', 'Role', 'Affiliation', 'Status', 'Volunteer Since'];
      const data = inactiveRows.map(r => [r.user_id, r.full_name, r.role, r.employer_org || r.department_or_batch, r.account_status, r.volunteer_since]);
      downloadCSV(`maatram_inactive_volunteers_${today}.csv`, headers, data);
    } else if (activeReport === 'CERTIFICATES') {
      const headers = ['Certificate ID', 'User ID', 'Activity ID', 'Certificate No', 'Issue Status', 'Issued Date', 'Verification Code'];
      const data = certificates.map(c => [
        c.certificate_id, c.user_id, c.activity_id, c.certificate_number || 'None', c.issue_status, c.issued_on || 'None', c.verification_code || 'None'
      ]);
      downloadCSV(`maatram_certificate_distribution_${today}.csv`, headers, data);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-maatram-primary mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Organizational Analytics & Data Audit</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Reports & Analytics Engine</h1>
          <p className="text-xs text-slate-500">
            Generate cross-activity audits, volunteer contribution summaries, alumni employer rankings, and export verified datasets.
          </p>
        </div>

        <button
          onClick={handleExportCurrent}
          className="px-4 py-2 bg-maatram-primary hover:bg-maatram-hover text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors flex-shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-maatram-gold" />
          <span>Export Filtered CSV</span>
        </button>
      </div>

      {/* Sub-Report Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-2 flex flex-wrap gap-1 text-xs font-bold">
        {[
          { id: 'ACTIVITIES', label: 'Activity Performance', icon: Calendar },
          { id: 'VOLUNTEERS', label: 'Volunteer Contributions', icon: Users },
          { id: 'ALUMNI_EMPLOYERS', label: 'Alumni Employers & Consistency', icon: Briefcase },
          { id: 'INACTIVITY', label: `Inactivity Analysis (${inactiveRows.length})`, icon: AlertTriangle },
          { id: 'CERTIFICATES', label: 'Certificate Distribution', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              className={clsx(
                'px-4 py-2 rounded-lg flex items-center gap-2 transition-colors',
                isActive
                  ? 'bg-maatram-primary text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <Icon className={clsx('w-3.5 h-3.5', isActive ? 'text-maatram-gold' : 'text-slate-400')} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ACTIVITIES */}
      {activeReport === 'ACTIVITIES' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-900">Activity Completion & Verified Hours Summary</span>
            <span className="text-slate-500">{activityReportRows.length} Activities Audited</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3">Activity</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Capacity</th>
                  <th className="px-5 py-3">Confirmed Volunteers</th>
                  <th className="px-5 py-3">Verified Hours</th>
                  <th className="px-5 py-3">Certificates</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activityReportRows.map((r) => (
                  <tr key={r.activity_id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{r.title}</p>
                      <span className="text-[10px] font-mono text-slate-400">{r.activity_id} • {r.mode}</span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">{r.category}</td>
                    <td className="px-5 py-3.5 text-slate-600">{r.start_date}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">{r.capacity}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{r.approved_volunteers}</td>
                    <td className="px-5 py-3.5 font-extrabold text-maatram-primary">{r.verified_hours} hrs</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{r.certificates_issued}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={r.status} type="activity" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: VOLUNTEERS */}
      {activeReport === 'VOLUNTEERS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden space-y-4">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="font-bold text-slate-900">Volunteer Participation & Verified Contributions</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">Filter Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-2.5 py-1 rounded border border-slate-300 font-semibold text-slate-800"
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">STUDENT</option>
                <option value="ALUMNI">ALUMNI</option>
                <option value="SUPPORTER">SUPPORTER</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3">Volunteer</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Department / Employer</th>
                  <th className="px-5 py-3">Active Since</th>
                  <th className="px-5 py-3">Applications</th>
                  <th className="px-5 py-3">Verified Hours</th>
                  <th className="px-5 py-3">Certificates</th>
                  <th className="px-5 py-3">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {volunteerReportRows.map((v) => (
                  <tr key={v.user_id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{v.name}</p>
                      <span className="text-[10px] font-mono text-slate-400">{v.user_id}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {v.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium">{v.department_or_employer || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500">{v.volunteer_since}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-800">{v.registrations_count}</td>
                    <td className="px-5 py-3.5 font-extrabold text-maatram-primary">{v.verified_hours} hrs</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{v.certificates_count}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={v.account_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ALUMNI & EMPLOYERS */}
      {activeReport === 'ALUMNI_EMPLOYERS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-900">Corporate Employer Attribution & Alumni Consistency</span>
            <span className="text-slate-500">{employerSummaryRows.length} Partner Organizations</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3">Employer Organization</th>
                  <th className="px-5 py-3">Active Alumni Volunteers</th>
                  <th className="px-5 py-3">Total Verified Hours</th>
                  <th className="px-5 py-3">Consistency Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employerSummaryRows.map((emp) => (
                  <tr key={emp.employer} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{emp.employer}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700">{emp.alumni_count}</td>
                    <td className="px-5 py-3.5 font-extrabold text-maatram-primary">{emp.verified_hours} hrs</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {emp.consistency_rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: INACTIVITY */}
      {activeReport === 'INACTIVITY' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden space-y-4 p-6">
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-xs text-rose-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Inactivity Audit & Retention Rule
            </p>
            <p>
              Volunteers flagged with <strong>INACTIVE_REVIEW</strong> have had zero activity or responses over an extended observation period. As per data minimization guidelines, their contact privileges are temporarily restricted pending Admin verification.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3">Volunteer</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Affiliation</th>
                  <th className="px-5 py-3">Volunteer Since</th>
                  <th className="px-5 py-3">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inactiveRows.map((u) => (
                  <tr key={u.user_id}>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{u.full_name}</p>
                      <span className="text-[10px] font-mono text-slate-400">{u.user_id}</span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-700">{u.role}</td>
                    <td className="px-5 py-3.5 text-slate-600">{u.employer_org || u.department_or_batch}</td>
                    <td className="px-5 py-3.5 text-slate-500">{u.volunteer_since}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={u.account_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CERTIFICATES */}
      {activeReport === 'CERTIFICATES' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-900">Certificate Credential Log</span>
            <span className="text-slate-500">{certificates.length} Total Records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3">Certificate ID</th>
                  <th className="px-5 py-3">Volunteer</th>
                  <th className="px-5 py-3">Activity ID</th>
                  <th className="px-5 py-3">Certificate No</th>
                  <th className="px-5 py-3">Issue Status</th>
                  <th className="px-5 py-3">Issued On</th>
                  <th className="px-5 py-3">Verification Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {certificates.map((c) => {
                  const volunteer = users.find((u) => u.user_id === c.user_id);
                  return (
                    <tr key={c.certificate_id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5 font-mono text-slate-500 font-medium">{c.certificate_id}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">{volunteer?.full_name}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-700">{c.activity_id}</td>
                      <td className="px-5 py-3.5 font-mono font-semibold text-slate-800">{c.certificate_number || '—'}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={c.issue_status} />
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{c.issued_on || '—'}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-emerald-800">{c.verification_code || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
