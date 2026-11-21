import React, { useState } from 'react';
import { useStorage, useCurrentUser } from '../../hooks/useStorage';
import { Certificate, Activity } from '../../types';
import { Award, Download, Printer, ShieldCheck, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export const VolunteerCertificatesView: React.FC = () => {
  const storage = useStorage();
  const [currentUser] = useCurrentUser();
  const [selectedCert, setSelectedCert] = useState<{ cert: Certificate; activity?: Activity } | null>(null);

  const certificates = storage.getCertificatesForUser(currentUser.user_id);
  const activities = storage.getActivities();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-maatram-primary mb-1">
            <Award className="w-4 h-4" />
            <span>Volunteer Credentials</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Certificates & Recognition</h1>
          <p className="text-xs text-slate-500">
            Official digital certificates awarded for verified participation in Maatram Foundation activities.
          </p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 space-y-3">
          <Award className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Certificates Issued Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Certificates are issued by the Office Admin once you participate in eligible opportunities and your volunteering hours are finalized.
          </p>
          <Link
            to="/opportunities"
            className="inline-block px-4 py-2 bg-maatram-primary hover:bg-maatram-hover text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            Explore Opportunities with Certificates
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => {
            const act = activities.find((a) => a.activity_id === cert.activity_id);
            const isIssued = cert.issue_status === 'ISSUED';

            return (
              <div
                key={cert.certificate_id}
                className={clsx(
                  'rounded-xl border p-5 flex flex-col justify-between transition-all shadow-subtle',
                  isIssued ? 'bg-white border-slate-200/90 hover:shadow-elevated' : 'bg-slate-50 border-dashed border-slate-300'
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">{cert.certificate_id}</span>
                    <span
                      className={clsx(
                        'text-[10px] font-bold px-2 py-0.5 rounded border',
                        isIssued
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      )}
                    >
                      {cert.issue_status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{act?.title || cert.activity_id}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{act?.start_date}</span>
                    </p>
                  </div>

                  {isIssued ? (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70 text-xs space-y-1">
                      <p className="text-[11px] text-slate-500">
                        Certificate No: <strong className="font-mono text-slate-900">{cert.certificate_number}</strong>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Verification Code: <strong className="font-mono text-emerald-800">{cert.verification_code}</strong>
                      </p>
                      <p className="text-[11px] text-slate-500">Issued Date: {cert.issued_on}</p>
                    </div>
                  ) : (
                    <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200/80 text-[11px] text-amber-900">
                      Attendance and hours verification are currently being processed by the Office Admin. Your certificate will unlock once finalized.
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                  {isIssued ? (
                    <button
                      onClick={() => setSelectedCert({ cert, activity: act })}
                      className="w-full py-2 bg-maatram-primary hover:bg-maatram-hover text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Award className="w-3.5 h-3.5 text-maatram-gold" />
                      <span>View & Download Certificate</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">Processing Verification</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-elevated border border-slate-300 max-w-3xl w-full p-8 space-y-6 relative overflow-hidden">
            <button
              onClick={() => setSelectedCert(null)}
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
                  Certificate of Volunteering Excellence & Social Service
                </p>
              </div>

              <div className="space-y-2 py-2">
                <p className="text-xs text-slate-500 italic">This is awarded to</p>
                <h3 className="text-2xl font-serif font-black text-slate-900 tracking-wide">
                  {currentUser.full_name}
                </h3>
                <p className="text-xs text-slate-600 max-w-lg mx-auto">
                  for outstanding commitment and verified volunteering service during{' '}
                  <strong className="text-slate-900">{selectedCert.activity?.title}</strong> on{' '}
                  <strong className="text-slate-900">{selectedCert.activity?.start_date}</strong>.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-xs">
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Certificate Number</span>
                  <p className="font-mono font-bold text-slate-800">{selectedCert.cert.certificate_number}</p>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Verification Code</span>
                  <p className="font-mono font-bold text-emerald-800">{selectedCert.cert.verification_code}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Authorized Authority</span>
                  <p className="font-bold text-slate-800">{selectedCert.activity?.coordinator || 'Office Admin'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedCert(null)}
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
