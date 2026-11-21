import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-maatram-primary text-white shadow-elevated mb-2">
            <Heart className="w-6 h-6 text-maatram-gold fill-maatram-gold/20" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-slate-500">
            Prototype account recovery for Maatram One
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-elevated space-y-4 text-xs">
          {submitted ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-maatram-primary mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Recovery Instructions Dispatched</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                In a production environment, a secure verification link would be delivered to <strong>{email}</strong>. For prototype testing, you can sign in directly using the demo switcher.
              </p>
              <Link
                to="/signin"
                className="inline-block px-4 py-2 bg-maatram-primary text-white font-semibold rounded-lg shadow-sm"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-slate-600 leading-relaxed">
                Enter your registered email address and we'll send you instructions to reset your demo access credentials.
              </p>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Registered Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul.menon@example.test"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-maatram-primary text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-maatram-primary hover:bg-maatram-hover text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Send Reset Link</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                <Link to="/signin" className="text-xs text-slate-500 hover:text-slate-800 font-medium">
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
