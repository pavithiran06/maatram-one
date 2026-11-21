import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStorage } from '../../hooks/useStorage';
import { Heart, Lock, Mail, ArrowRight, ShieldCheck, GraduationCap, Briefcase, HeartHandshake, Check } from 'lucide-react';
import clsx from 'clsx';

export const SignInPage: React.FC = () => {
  const storage = useStorage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@maatram.example.test');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState<string | null>(null);

  const users = storage.getUsers();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (user) {
      storage.setCurrentUser(user.user_id);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/hub');
      }
    } else {
      setError('No demo account registered with this email. Select one of the quick demo accounts below.');
    }
  };

  const handleQuickLogin = (userId: string) => {
    storage.setCurrentUser(userId);
    const user = storage.getUserById(userId);
    if (user?.role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/hub');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Logo and Intro */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-maatram-primary text-white shadow-elevated mb-2">
            <Heart className="w-6 h-6 text-maatram-gold fill-maatram-gold/20" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to Maatram One
          </h1>
          <p className="text-xs text-slate-500">
            Professional volunteer management & community coordination
          </p>
        </div>

        {/* Quick Demo Switcher Cards */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-subtle space-y-2.5">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-center">
            One-Click Demo Personas
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'U001', name: 'Ananya Krishnan', role: 'STUDENT', desc: 'B.Sc CS (Batch 2027)' },
              { id: 'U002', name: 'Rahul Menon', role: 'ALUMNI', desc: 'TCS (Batch 2022)' },
              { id: 'U005', name: 'Divya Raman', role: 'SUPPORTER', desc: 'Healthcare Supporter' },
              { id: 'U011', name: 'Office Admin', role: 'ADMIN', desc: 'Full Platform Admin' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleQuickLogin(p.id)}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-maatram-primary hover:bg-emerald-50/60 text-left transition-all text-xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 group-hover:text-maatram-primary">{p.name}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                    {p.role}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-elevated space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-maatram-primary text-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-maatram-primary hover:underline font-semibold">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-maatram-primary text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-maatram-primary hover:bg-maatram-hover text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Sign In with Demo Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-maatram-primary font-bold hover:underline">
              Register as New Volunteer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
