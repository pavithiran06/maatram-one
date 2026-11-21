import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useStorage';
import { RoleSwitcher } from './RoleSwitcher';
import { OfficeContactModal } from './OfficeContactModal';
import { 
  Heart, 
  Menu, 
  X, 
  PhoneCall, 
  Compass, 
  Calendar, 
  MessageSquare, 
  Award, 
  Settings, 
  LayoutDashboard, 
  UserCheck, 
  Clock, 
  FileText, 
  FileEdit,
  Users
} from 'lucide-react';
import clsx from 'clsx';

export const Header: React.FC = () => {
  const [currentUser] = useCurrentUser();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const isAdmin = currentUser.role === 'ADMIN';

  const volunteerLinks = [
    { to: '/hub', label: 'Volunteer Hub', icon: Compass },
    { to: '/opportunities', label: 'Opportunities', icon: Calendar },
    { to: '/my-workspace', label: 'My Volunteering', icon: UserCheck },
    { to: '/groups', label: 'Coordination Groups', icon: MessageSquare },
    { to: '/certificates', label: 'Certificates', icon: Award },
    { to: '/preferences', label: 'Preferences', icon: Settings },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/opportunities', label: 'Activities', icon: Calendar },
    { to: '/admin/registrations', label: 'Approvals', icon: UserCheck },
    { to: '/admin/availability', label: 'Availability', icon: Clock },
    { to: '/admin/groups', label: 'Groups', icon: MessageSquare },
    { to: '/admin/attendance', label: 'Attendance', icon: Clock },
    { to: '/admin/certificates', label: 'Certificates', icon: Award },
    { to: '/admin/reports', label: 'Reports', icon: FileText },
    { to: '/admin/hub-cms', label: 'Hub CMS', icon: FileEdit },
    { to: '/admin/volunteers', label: 'Volunteers', icon: Users },
  ];

  const navLinks = isAdmin ? adminLinks : volunteerLinks;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-subtle">
        {/* Top bar for Role notice / Prototype status */}
        <div className="bg-maatram-dark text-white text-[11px] px-4 py-1 flex items-center justify-between border-b border-emerald-950/40">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium tracking-wide">MAATRAM FOUNDATION • PROTOTYPE MODE</span>
            <span className="text-white/40 hidden md:inline">|</span>
            <span className="text-white/70 hidden md:inline">Logged in as {currentUser.full_name} ({currentUser.role})</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setContactModalOpen(true)}
              className="hover:text-maatram-gold transition-colors flex items-center gap-1 text-[11px] font-semibold text-emerald-200"
            >
              <PhoneCall className="w-3 h-3 text-maatram-gold" />
              <span>Contact Office Team</span>
            </button>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link to={isAdmin ? '/admin' : '/hub'} className="flex items-center space-x-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-maatram-primary flex items-center justify-center text-white shadow-card group-hover:bg-maatram-hover transition-colors">
                  <Heart className="w-5 h-5 text-maatram-gold fill-maatram-gold/20" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-lg text-maatram-primary tracking-tight">Maatram</span>
                    <span className="text-xs px-1.5 py-0.5 rounded font-black tracking-wider uppercase bg-maatram-gold text-slate-900">
                      ONE
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase -mt-0.5">
                    Volunteer Platform
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.slice(0, 7).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to || (item.to !== '/admin' && item.to !== '/hub' && location.pathname.startsWith(item.to));
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={clsx(
                      'px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors',
                      isActive
                        ? 'bg-emerald-50 text-maatram-primary font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    )}
                  >
                    <Icon className={clsx('w-3.5 h-3.5', isActive ? 'text-maatram-primary' : 'text-slate-400')} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Overflow dropdown for admin if needed */}
              {navLinks.length > 7 && (
                <div className="relative group">
                  <button className="px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1">
                    <span>More</span>
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-elevated py-1 hidden group-hover:block z-50">
                    {navLinks.slice(7).map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                        >
                          <Icon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </nav>

            {/* Right Controls: Role Switcher & Mobile Menu Button */}
            <div className="flex items-center space-x-3">
              <RoleSwitcher />

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in slide-in-from-top duration-150">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    'flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors',
                    isActive
                      ? 'bg-emerald-50 text-maatram-primary font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <Icon className={clsx('w-4 h-4', isActive ? 'text-maatram-primary' : 'text-slate-400')} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-100 mt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setContactModalOpen(true);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-maatram-primary bg-emerald-50/60 rounded-lg"
              >
                <PhoneCall className="w-3.5 h-3.5 text-maatram-gold" />
                <span>Contact Office Team (+91 90000 00199)</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Office Contact Modal */}
      <OfficeContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
    </>
  );
};
