import React, { useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { AttendanceStatus, VerificationStatus, AttendanceRecord } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Clock, 
  CheckCheck, 
  Search, 
  CheckCircle2, 
  Edit3, 
  History, 
  Award, 
  Trophy, 
  FileCheck2, 
  AlertCircle,
  HelpCircle,
  Building,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export const AttendanceManagementPage: React.FC = () => {
  const storage = useStorage();
  const [selectedActivityId, setSelectedActivityId] = useState<string>('ALL');
  const [toast, setToast] = useState<string | null>(null);

  // Correction Modal with audit reason
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editHours, setEditHours] = useState<number>(0);
  const [editReason, setEditReason] = useState<string>('');

  const attendance = storage.getAttendance();
  const activities = storage.getActivities();
  const users = storage.getUsers();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleFinalize = (attendanceId: string, hours: number) => {
    storage.finalizeAttendance(attendanceId, hours);
    showToast(`Attendance finalized with ${hours} verified hours.`);
  };

  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    if (!editReason.trim()) {
      alert('A valid reason is required to correct a finalized record.');
      return;
    }
    storage.finalizeAttendance(editingRecord.attendance_id, editHours, editReason);
    showToast(`Record updated with audit note: "${editReason}"`);
    setEditingRecord(null);
    setEditReason('');
  };

  // Filter pipeline
  const filtered = attendance.filter((a) => {
    if (selectedActivityId !== 'ALL' && a.activity_id !== selectedActivityId) return false;
    return true;
  });

  const totalVerifiedHours = attendance
    .filter((a) => a.verification_status === 'FINALIZED')
    .reduce((sum, a) => sum + (Number(a.hours_verified) || 0), 0);

  const finalizedCount = attendance.filter((a) => a.verification_status === 'FINALIZED').length;
  const pendingCount = attendance.filter((a) => a.verification_status !== 'FINALIZED').length;

  // Leaderboard based strictly on finalized verified hours
  const volunteerHourMap = new Map<string, number>();
  attendance
    .filter((a) => a.verification_status === 'FINALIZED')
    .forEach((a) => {
      const current = volunteerHourMap.get(a.user_id) || 0;
      volunteerHourMap.set(a.user_id, current + a.hours_verified);
    });

  const leaderboard = Array.from(volunteerHourMap.entries())
    .map(([userId, hours]) => {
      const user = users.find((u) => u.user_id === userId);
      return { user, hours };
    })
    .sort((a, b) => b.hours - a.hours);

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
            <Clock className="w-4 h-4" />
            <span>Hours Verification Desk</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Attendance & Verified Volunteering Hours</h1>
          <p className="text-xs text-slate-500">
            Review check-in timestamps, finalize canonical hours, and maintain audit-compliant correction history.
          </p>
        </div>
      </div>

      {/* KPI Cards & Leaderboard Ribbon */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Total Hours Metric */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-subtle space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Total Verified Hours
          </span>
          <p className="text-3xl font-extrabold text-maatram-primary">{totalVerifiedHours.toFixed(2)} hrs</p>
          <p className="text-xs text-slate-500 font-medium">Canonical audit-ready organizational total</p>
        </div>

        {/* Finalized Status */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-subtle space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Finalized Attendance
          </span>
          <p className="text-3xl font-extrabold text-slate-900">{finalizedCount}</p>
          <p className="text-xs text-slate-500 font-medium">
            {pendingCount} record{pendingCount !== 1 ? 's' : ''} awaiting admin review
          </p>
        </div>

        {/* Verified Hours Leaderboard */}
        <div className="lg:col-span-2 p-5 bg-gradient-to-r from-emerald-900 to-maatram-dark text-white rounded-xl border border-emerald-950 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-maatram-gold tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-maatram-gold" />
              Verified Hours Leaderboard (Finalized Only)
            </span>
            <span className="text-[10px] text-emerald-200">Top Contributors</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {leaderboard.slice(0, 3).map((item, idx) => (
              <div key={item.user?.user_id || idx} className="bg-white/10 rounded-lg p-2.5 text-center">
                <span className="text-[10px] font-bold text-maatram-gold">Rank #{idx + 1}</span>
                <p className="text-xs font-bold text-white truncate">{item.user?.full_name}</p>
                <p className="text-xs font-extrabold text-emerald-200">{item.hours} hrs</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="w-full sm:w-72">
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Filter by Activity</label>
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

        <div className="text-xs text-slate-500">
          Showing {filtered.length} attendance records
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Attendance ID</th>
                <th className="px-5 py-3">Volunteer</th>
                <th className="px-5 py-3">Activity</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Check-In / Out</th>
                <th className="px-5 py-3">Calculated Duration</th>
                <th className="px-5 py-3">Verified Hours</th>
                <th className="px-5 py-3">Verification</th>
                <th className="px-5 py-3 text-right">Audit & Finalize</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((record) => {
                const volunteer = users.find((u) => u.user_id === record.user_id);
                const act = activities.find((a) => a.activity_id === record.activity_id);

                return (
                  <tr key={record.attendance_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-500 font-medium">{record.attendance_id}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{volunteer?.full_name}</p>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-slate-100 text-slate-700">
                        {volunteer?.role}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{volunteer?.employer_org || volunteer?.department_or_batch}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/admin/activities/${record.activity_id}`}
                        className="font-bold text-slate-900 hover:text-maatram-primary transition-colors block"
                      >
                        {act?.title || record.activity_id}
                      </Link>
                      <p className="text-[11px] text-slate-500">{act?.start_date}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={record.attendance_status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {record.check_in ? (
                        <span>
                          {record.check_in.split(' ')[1]} – {record.check_out?.split(' ')[1]}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No check-in</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">
                      {record.hours_calculated > 0 ? `${record.hours_calculated}h` : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-extrabold text-maatram-primary">
                        {record.hours_verified} hrs
                      </span>
                      {record.correction_reason && (
                        <p className="text-[10px] text-amber-700 italic mt-0.5" title={record.correction_reason}>
                          Corrected: {record.correction_reason}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={record.verification_status} type="verification" />
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                      {record.verification_status !== 'FINALIZED' ? (
                        <button
                          onClick={() => handleFinalize(record.attendance_id, record.hours_calculated || 5)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px] shadow-sm"
                        >
                          Finalize Hours
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingRecord(record);
                            setEditHours(record.hours_verified);
                            setEditReason(record.correction_reason || '');
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold rounded text-[11px] inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3 text-slate-500" />
                          <span>Correct Record</span>
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

      {/* Audit Correction Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <form onSubmit={handleSaveCorrection} className="bg-white rounded-xl shadow-elevated border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-2">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                <History className="w-3.5 h-3.5" /> Audited Correction
              </span>
              <h3 className="text-base font-bold text-slate-900">Correct Finalized Record ({editingRecord.attendance_id})</h3>
              <p className="text-slate-500">Changes to finalized verified hours require an audit justification note.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Verified Hours</label>
              <input
                type="number"
                step="0.25"
                min="0"
                max="24"
                required
                value={editHours}
                onChange={(e) => setEditHours(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason for Adjustment *</label>
              <textarea
                rows={3}
                required
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="e.g. Session extended by 30 mins for Q&A, confirmed with school principal."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-maatram-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-maatram-primary hover:bg-maatram-hover text-white font-semibold rounded-lg shadow-sm"
              >
                Save Correction & Audit Trail
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
