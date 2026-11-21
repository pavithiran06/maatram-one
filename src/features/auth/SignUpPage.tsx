import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStorage } from '../../hooks/useStorage';
import { UserRole } from '../../types';
import { Heart, GraduationCap, Briefcase, HeartHandshake, ArrowRight, UserPlus, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export const SignUpPage: React.FC = () => {
  const storage = useStorage();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('STUDENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('9000000150');
  const [departmentOrBatch, setDepartmentOrBatch] = useState('B.Sc Computer Science - II Year');
  const [graduationYear, setGraduationYear] = useState<number>(2028);
  const [employerOrg, setEmployerOrg] = useState('');
  const [skills, setSkills] = useState('Student Mentoring, Event Organization');

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    const newUser = storage.createUser({
      full_name: fullName.trim(),
      role,
      email: email.trim().toLowerCase(),
      phone_demo: phone,
      department_or_batch: departmentOrBatch,
      graduation_year: role === 'SUPPORTER' ? null : graduationYear,
      employer_org: role === 'ALUMNI' ? employerOrg || 'Corporate Partner' : null,
      skills,
      account_status: 'ACTIVE',
    });

    storage.setCurrentUser(newUser.user_id);
    navigate('/hub');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-maatram-primary text-white shadow-elevated mb-2">
            <Heart className="w-6 h-6 text-maatram-gold fill-maatram-gold/20" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Join the Maatram Volunteer Community
          </h1>
          <p className="text-xs text-slate-500">
            Create your volunteer profile to discover opportunities, coordinate in groups, and earn verified impact certificates.
          </p>
        </div>

        <form onSubmit={handleSignUp} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-elevated space-y-5 text-xs">
          {/* Role Selection */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800">Select Volunteer Classification *</label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { r: 'STUDENT' as UserRole, label: 'Student', icon: GraduationCap, desc: 'Active Scholar' },
                { r: 'ALUMNI' as UserRole, label: 'Alumni', icon: Briefcase, desc: 'Corporate Graduate' },
                { r: 'SUPPORTER' as UserRole, label: 'Supporter', icon: HeartHandshake, desc: 'Community Advocate' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = role === item.r;
                return (
                  <button
                    key={item.r}
                    type="button"
                    onClick={() => setRole(item.r)}
                    className={clsx(
                      'p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1',
                      isSelected
                        ? 'bg-emerald-50/90 border-maatram-primary text-maatram-primary shadow-sm ring-1 ring-maatram-primary'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-bold text-xs">{item.label}</span>
                    <span className="text-[10px] text-slate-400">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Harini Sundaram"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-maatram-primary text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. harini@example.test"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-maatram-primary text-xs"
              />
            </div>
          </div>

          {/* Role-Specific Fields */}
          {role === 'STUDENT' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <div>
                <label className="block font-bold text-slate-700 mb-1">College Department / Batch *</label>
                <input
                  type="text"
                  required
                  value={departmentOrBatch}
                  onChange={(e) => setDepartmentOrBatch(e.target.value)}
                  placeholder="e.g. B.Tech IT - III Year"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expected Graduation Year *</label>
                <input
                  type="number"
                  min="2024"
                  max="2032"
                  required
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(parseInt(e.target.value) || 2028)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>
            </div>
          )}

          {role === 'ALUMNI' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Degree & Major *</label>
                <input
                  type="text"
                  required
                  value={departmentOrBatch}
                  onChange={(e) => setDepartmentOrBatch(e.target.value)}
                  placeholder="e.g. B.E. Computer Science"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Graduation Year *</label>
                <input
                  type="number"
                  min="2010"
                  max="2026"
                  required
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(parseInt(e.target.value) || 2022)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Employer Organization *</label>
                <input
                  type="text"
                  required
                  value={employerOrg}
                  onChange={(e) => setEmployerOrg(e.target.value)}
                  placeholder="e.g. Tata Consultancy Services"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>
            </div>
          )}

          {role === 'SUPPORTER' && (
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
              <label className="block font-bold text-slate-700 mb-1">Community Background & Interest *</label>
              <input
                type="text"
                required
                value={departmentOrBatch}
                onChange={(e) => setDepartmentOrBatch(e.target.value)}
                placeholder="e.g. Healthcare Volunteer / CSR Professional"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Volunteering Skills & Specializations *</label>
            <input
              type="text"
              required
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Mock Interviews, School Outreach, Career Guidance"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-maatram-primary hover:bg-maatram-hover text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>Complete Registration & Enter Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <p className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/signin" className="text-maatram-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
