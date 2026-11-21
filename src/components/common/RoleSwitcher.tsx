import React, { useState } from 'react';
import { useStorage, useCurrentUser } from '../../hooks/useStorage';
import { UserRole } from '../../types';
import { Users, RotateCcw, ChevronDown, Check, ShieldCheck, GraduationCap, Briefcase, HeartHandshake } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

export const RoleSwitcher: React.FC = () => {
  const storage = useStorage();
  const [currentUser, setCurrentUser] = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const navigate = useNavigate();

  const allUsers = storage.getUsers();

  const handleSelectUser = (userId: string) => {
    setCurrentUser(userId);
    setIsOpen(false);
    const selected = allUsers.find(u => u.user_id === userId);
    if (selected) {
      if (selected.role === 'ADMIN') {
        navigate('/admin');
      } else {
        // As per Section 6.B: Student and Alumni land on the SAME Volunteer Description / Volunteer Hub page
        navigate('/hub');
      }
    }
  };

  const handleResetData = () => {
    storage.resetToSeedData();
    setResetConfirm(false);
    setIsOpen(false);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />;
      case 'ALUMNI':
        return <Briefcase className="w-3.5 h-3.5 text-blue-600" />;
      case 'STUDENT':
        return <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />;
      case 'SUPPORTER':
        return <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'ALUMNI':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'STUDENT':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'SUPPORTER':
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-white/90 border border-slate-200 shadow-sm hover:bg-white transition-all text-left text-xs"
        aria-expanded={isOpen}
      >
        <div className="w-6 h-6 rounded-full bg-maatram-primary/10 flex items-center justify-center font-bold text-maatram-primary text-xs">
          {currentUser.full_name.charAt(0)}
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-800 max-w-[120px] truncate">{currentUser.full_name}</span>
            <span className={clsx('text-[10px] font-bold px-1.5 py-0.2 rounded border', getRoleBadgeClass(currentUser.role))}>
              {currentUser.role}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 truncate max-w-[150px]">
            {currentUser.employer_org || currentUser.department_or_batch}
          </p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-elevated border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-maatram-primary" />
                  Prototype Role & User Switcher
                </p>
                <p className="text-[11px] text-slate-500">Switch personas to test role-specific workflows</p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/70">
              <p className="text-[10px] uppercase font-bold text-slate-400 px-2 mb-1.5 tracking-wider">Quick Presets</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'U001', name: 'Ananya (Student)', role: 'STUDENT' },
                  { id: 'U002', name: 'Rahul (Alumni - TCS)', role: 'ALUMNI' },
                  { id: 'U005', name: 'Divya (Supporter)', role: 'SUPPORTER' },
                  { id: 'U011', name: 'Office Admin', role: 'ADMIN' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectUser(preset.id)}
                    className={clsx(
                      'text-left px-2 py-1.5 rounded text-xs font-medium border flex items-center justify-between transition-colors',
                      currentUser.user_id === preset.id
                        ? 'bg-maatram-primary text-white border-maatram-primary'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                    )}
                  >
                    <span className="truncate">{preset.name}</span>
                    {currentUser.user_id === preset.id && <Check className="w-3 h-3 text-white ml-1 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Full 11-User Demo Catalog */}
            <div className="max-h-60 overflow-y-auto p-1 divide-y divide-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">All 11 Seed Accounts</p>
              {allUsers.map((u) => (
                <button
                  key={u.user_id}
                  onClick={() => handleSelectUser(u.user_id)}
                  className={clsx(
                    'w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between text-xs transition-colors hover:bg-slate-50',
                    currentUser.user_id === u.user_id && 'bg-emerald-50/80'
                  )}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      {getRoleIcon(u.role)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900 truncate">{u.full_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({u.user_id})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {u.employer_org || u.department_or_batch}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 flex-shrink-0 ml-2">
                    <span className={clsx('text-[10px] px-1.5 py-0.5 rounded border font-semibold', getRoleBadgeClass(u.role))}>
                      {u.role}
                    </span>
                    {currentUser.user_id === u.user_id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Reset Seed Data */}
            <div className="p-2 border-t border-slate-100 bg-slate-50">
              {resetConfirm ? (
                <div className="space-y-1.5">
                  <p className="text-[11px] text-rose-700 font-medium">Reset all records to initial demo state?</p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={handleResetData}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded"
                    >
                      Confirm Reset
                    </button>
                    <button
                      onClick={() => setResetConfirm(false)}
                      className="px-2.5 py-1 bg-slate-200 text-slate-700 text-xs rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setResetConfirm(true)}
                  className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo Data to Initial State</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
