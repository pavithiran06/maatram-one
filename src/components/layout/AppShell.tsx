import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../common/Header';
import { Heart, Shield, CheckCircle2, Mail, ExternalLink } from 'lucide-react';

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-maatram-ivory text-slate-800">
      <Header />
      
      <main className="flex-1 pb-16">
        <Outlet />
      </main>

      {/* Corporate Professional Footer */}
      <footer className="bg-maatram-dark text-white border-t border-emerald-950/50 py-10 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-maatram-gold">
                  <Heart className="w-4 h-4" />
                </div>
                <span className="font-bold text-base tracking-tight text-white">Maatram One</span>
              </div>
              <p className="text-xs text-emerald-100/70 leading-relaxed">
                Centralized volunteer engagement, opportunity management, and community impact coordination for Maatram Foundation.
              </p>
              <div className="flex items-center space-x-2 text-[11px] text-maatram-gold font-medium">
                <Shield className="w-3.5 h-3.5" />
                <span>Verified Hours & Controlled Certification</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-3">Core Volunteer Pillars</h4>
              <ul className="space-y-2 text-xs text-emerald-100/70">
                <li>• School Visits & Outreach</li>
                <li>• Admissions Support Helpdesk</li>
                <li>• Background Verification (BGV)</li>
                <li>• Student Mock Interviews</li>
                <li>• Admission Panel Interviews</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-3">Governance & Privacy</h4>
              <ul className="space-y-2 text-xs text-emerald-100/70">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dual-Source Do Not Contact</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Encrypted Volunteer Data</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Audit Trail</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Deterministic Lifecycle Controls</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-3">Office Coordination Desk</h4>
              <p className="text-xs text-emerald-100/70 mb-2">
                Central Secretariat, Chennai, Tamil Nadu
              </p>
              <p className="text-xs text-white font-semibold">
                Helpline: +91 90000 00199
              </p>
              <p className="text-xs text-emerald-200/80">
                Email: admin@maatram.example.test
              </p>
              <div className="mt-4 pt-3 border-t border-emerald-900/60 text-[11px] text-emerald-100/50">
                Fictional demo data for prototype evaluation only.
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-emerald-950/60 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-100/50">
            <p>© {new Date().getFullYear()} Maatram Foundation. All rights reserved.</p>
            <p className="mt-2 sm:mt-0 font-medium text-emerald-200/80">
              Maatram One — Built with precision for educational transformation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
