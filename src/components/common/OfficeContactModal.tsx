import React from 'react';
import { Phone, Mail, Clock, MapPin, X, ShieldAlert, MessageSquare } from 'lucide-react';

interface OfficeContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfficeContactModal: React.FC<OfficeContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-elevated border border-slate-200 max-w-lg w-full overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="office-contact-title"
      >
        {/* Header */}
        <div className="bg-maatram-primary px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Phone className="w-4 h-4 text-maatram-gold" />
            </div>
            <div>
              <h2 id="office-contact-title" className="text-base font-semibold">Contact with Office Team</h2>
              <p className="text-xs text-white/80">Approved coordination helpline & support channels</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Privacy Protection Notice:</strong> Volunteer personal contact numbers are never shared publicly. All official coordination flows exclusively through verified Maatram Office channels.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-maatram-primary flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Volunteer Desk Mobile</p>
                  <p className="text-sm font-semibold text-slate-900">+91 90000 00199</p>
                </div>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">Primary</span>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Official Email Desk</p>
                  <p className="text-sm font-semibold text-slate-900">admin@maatram.example.test</p>
                </div>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">Email</span>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Operating Hours</p>
                  <p className="text-sm font-semibold text-slate-900">Monday – Saturday: 09:00 – 18:00 IST</p>
                </div>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">Live</span>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Head Office Location</p>
                <p className="text-sm font-semibold text-slate-900">Maatram Foundation, Central Secretariat, Chennai, Tamil Nadu</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
