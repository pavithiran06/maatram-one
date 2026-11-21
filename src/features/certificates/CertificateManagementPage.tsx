import React, { useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Certificate, User, Activity } from '../../types';
import { 
  Award, 
  Search, 
  CheckCircle2, 
  Printer, 
  FileCheck2, 
  Sparkles, 
  Download, 
  ShieldCheck, 
  X,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export const CertificateManagementPage: React.FC = () => {
  const storage = useStorage();
  const [selectedActivityId, setSelectedActivityId] = useState<string>('ALL');
  const [previewCert, setPreviewCert] = useState<{ cert: Certificate; user?: User; activity?: Activity } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const certificates = storage.getCertificates();
  const activities = storage.getActivities();
  const users = storage.getUsers();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleIssue = (activityId: string, userId: string) => {
    const cert = storage.issueCertificate(activityId, userId);
    showToast(`Certificate ${cert.certificate_number} issued successfully!`);
  };

  const filtered = certificates.filter((c) => {
    if (selectedActivityId !== 'ALL' && c.activity_id !== selectedActivityId) return false;
    return true;
  });

  const issuedCount = certificates.filter((c) => c.issue_status === 'ISSUED').length;
  const pendingCount = certificates.filter((c) => c.issue_status !== 'ISSUED').length;

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
            <Award className="w-4 h-4" />
            <span>Recognition & Credentials</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Certificate Issuance & Distribution</h1>
          <p className="text-xs text-slate-500">
            Issue verified certificates of volunteering with unique verification codes and official tracking.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-subtle space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Issued & Delivered
          </span>
          <p className="text-3xl font-extrabold text-maatram-primary">{issuedCount}</p>
          <p className="text-xs text-slate-500 font-medium">Verified credentials with active verification codes</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-subtle space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Pending Eligibility
          </span>
          <p className="text-3xl font-extrabold text-amber-700">{pendingCount}</p>
          <p className="text-xs text-slate-500 font-medium">Awaiting final attendance & verified hours confirmation</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-subtle space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Verification Format
          </span>
          <p className="text-sm font-bold text-slate-900 font-mono mt-1">VERIFY-M1-XXXX</p>
          <p className="text-xs text-slate-500 font-medium">Tamper-evident verification sequence</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle flex items-center justify-between text-xs">
        <div className="w-72">
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
        <span className="text-xs text-slate-500">Showing {filtered.length} certificates</span>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Certificate ID</th>
                <th className="px-5 py-3">Volunteer</th>
                <th className="px-5 py-3">Activity</th>
                <th className="px-5 py-3">Certificate Number</th>
                <th className="px-5 py-3">Issue Status</th>
                <th className="px-5 py-3">Issued On</th>
                <th className="px-5 py-3">Verification Code</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((cert) => {
                const volunteer = users.find((u) => u.user_id === cert.user_id);
                const act = activities.find((a) => a.activity_id === cert.activity_id);

                return (
                  <tr key={cert.certificate_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-500 font-medium">{cert.certificate_id}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{volunteer?.full_name}</p>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-50 text-emerald-800">
                        {volunteer?.role}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{volunteer?.employer_org || volunteer?.department_or_batch}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/admin/activities/${cert.activity_id}`}
                        className="font-bold text-slate-900 hover:text-maatram-primary transition-colors block"
                      >
                        {act?.title || cert.activity_id}
                      </Link>
                      <p className="text-[11px] text-slate-500">{act?.start_date}</p>
                    </td>
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-700">
                      {cert.certificate_number || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={cert.issue_status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{cert.issued_on || '—'}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-emerald-800">
                      {cert.verification_code || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      {cert.issue_status === 'ISSUED' ? (
                        <button
                          onClick={() => setPreviewCert({ cert, user: volunteer, activity: act })}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold rounded text-[11px] inline-flex items-center gap-1 shadow-sm"
                        >
                          <Award className="w-3 h-3 text-maatram-gold" />
                          <span>View Preview</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleIssue(cert.activity_id, cert.user_id)}
                          className="px-3 py-1 bg-maatram-primary hover:bg-maatram-hover text-white font-semibold rounded text-[11px] shadow-sm"
                        >
                          Issue Certificate
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

      {/* Certificate Preview Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-elevated border border-slate-300 max-w-3xl w-full p-8 space-y-6 relative overflow-hidden">
            <button
              onClick={() => setPreviewCert(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>

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
                  Official Certificate of Volunteering Recognition
                </p>
              </div>

              <div className="space-y-2 py-2">
                <p className="text-xs text-slate-500 italic">This credential is certified to</p>
                <h3 className="text-2xl font-serif font-black text-slate-900 tracking-wide">
                  {previewCert.user?.full_name}
                </h3>
                <p className="text-xs text-slate-600 max-w-lg mx-auto">
                  in appreciation of verified leadership, active participation, and dedicated community contribution during{' '}
                  <strong className="text-slate-900">{previewCert.activity?.title}</strong> on{' '}
                  <strong className="text-slate-900">{previewCert.activity?.start_date}</strong>.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-xs">
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Certificate ID</span>
                  <p className="font-mono font-bold text-slate-800">{previewCert.cert.certificate_number}</p>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Verification Code</span>
                  <p className="font-mono font-bold text-emerald-800">{previewCert.cert.verification_code}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Issuance Authority</span>
                  <p className="font-bold text-slate-800">{previewCert.activity?.coordinator || 'Office Admin'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewCert(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-maatram-primary hover:bg-maatram-hover text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
