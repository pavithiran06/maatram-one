import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStorage, useCurrentUser } from '../../hooks/useStorage';
import { StatusBadge } from '../../components/common/StatusBadge';
import { OfficeContactModal } from '../../components/common/OfficeContactModal';
import { 
  Sparkles, 
  GraduationCap, 
  Building, 
  FileCheck2, 
  Users, 
  Award, 
  ArrowRight, 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronRight, 
  PhoneCall, 
  ShieldCheck, 
  Compass,
  AlertCircle
} from 'lucide-react';
import clsx from 'clsx';
import { Activity } from '../../types';

export const VolunteerHubPage: React.FC = () => {
  const storage = useStorage();
  const [currentUser] = useCurrentUser();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [applyingActivity, setApplyingActivity] = useState<Activity | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const hubSections = storage.getHubSections().filter(s => s.is_published);
  const categories = storage.getCategories().filter(c => c.active === 'Yes');
  const activities = storage.getActivities().filter(a => a.status === 'PUBLISHED' || a.status === 'IN_PROGRESS');
  const userRegistrations = storage.getRegistrationsForUser(currentUser.user_id);

  const introSection = hubSections.find(s => s.section_type === 'INTRO');
  const benefitsSection = hubSections.find(s => s.section_type === 'BENEFITS');
  const howToSection = hubSections.find(s => s.section_type === 'HOW_TO');

  const filteredActivities = activities.filter(a => {
    if (selectedCategory === 'ALL') return true;
    return a.category_id === selectedCategory;
  });

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'CAT01': return GraduationCap;
      case 'CAT02': return Building;
      case 'CAT03': return FileCheck2;
      case 'CAT04': return Users;
      case 'CAT05': return Award;
      default: return Sparkles;
    }
  };

  const handleApply = (activity: Activity) => {
    const result = storage.registerForActivity(activity.activity_id, currentUser.user_id);
    if (result.success) {
      setFeedbackMsg({ type: 'success', text: result.message });
    } else {
      setFeedbackMsg({ type: 'error', text: result.message });
    }
    setApplyingActivity(null);
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const getRegistrationForActivity = (activityId: string) => {
    return userRegistrations.find(r => r.activity_id === activityId && r.status !== 'REJECTED');
  };

  return (
    <div className="space-y-12">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top duration-200">
          <div className={clsx(
            'flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-elevated border text-xs font-semibold',
            feedbackMsg.type === 'success' 
              ? 'bg-emerald-900 text-white border-emerald-700' 
              : 'bg-rose-900 text-white border-rose-700'
          )}>
            {feedbackMsg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-300" /> : <AlertCircle className="w-4 h-4 text-rose-300" />}
            <span>{feedbackMsg.text}</span>
          </div>
        </div>
      )}

      {/* Hero / Introduction Header */}
      <section className="bg-gradient-to-b from-maatram-primary to-maatram-dark text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-950/60 shadow-elevated">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-maatram-gold text-xs font-semibold border border-white/10">
            <Compass className="w-3.5 h-3.5" />
            <span>Volunteer Description & Coordination Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
            {introSection ? introSection.title : 'Empower Youth Through Purposeful Volunteering'}
          </h1>
          <p className="text-base sm:text-lg text-emerald-100/90 max-w-3xl mx-auto leading-relaxed font-light">
            {introSection ? introSection.body : 'Connecting Students, Alumni, and Community Supporters for Measurable Social Impact across Tamil Nadu.'}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#opportunities-section"
              className="px-5 py-2.5 rounded-lg bg-maatram-gold hover:bg-maatram-gold-dark text-slate-900 font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2"
            >
              <span>Explore Open Opportunities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setContactModalOpen(true)}
              className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-2"
            >
              <PhoneCall className="w-3.5 h-3.5 text-maatram-gold" />
              <span>Contact Office Team</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Core Pillars / 5 Volunteering Areas */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-maatram-primary">Organizational Pillars</p>
              <h2 className="text-2xl font-extrabold text-slate-900">Maatram Volunteering Areas</h2>
            </div>
            <p className="text-xs text-slate-500 max-w-md">
              Five structured volunteering pathways designed for verifiable contributions and student mentorship.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.category_id);
              const isSelected = selectedCategory === cat.category_id;
              const count = activities.filter(a => a.category_id === cat.category_id).length;

              return (
                <button
                  key={cat.category_id}
                  onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat.category_id)}
                  className={clsx(
                    'p-4 rounded-xl border text-left transition-all relative overflow-hidden group flex flex-col justify-between',
                    isSelected
                      ? 'bg-emerald-900 text-white border-emerald-800 shadow-elevated ring-2 ring-maatram-gold'
                      : 'bg-white text-slate-800 border-slate-200/80 hover:border-maatram-primary/40 hover:shadow-card'
                  )}
                >
                  <div className="space-y-2.5">
                    <div className={clsx(
                      'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                      isSelected ? 'bg-white/20 text-maatram-gold' : 'bg-emerald-50 text-maatram-primary group-hover:bg-maatram-primary group-hover:text-white'
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className={clsx('text-[10px] font-mono uppercase tracking-wider', isSelected ? 'text-emerald-200' : 'text-slate-400')}>
                        {cat.category_id}
                      </span>
                      <h3 className={clsx('text-sm font-bold leading-snug', isSelected ? 'text-white' : 'text-slate-900')}>
                        {cat.category_name}
                      </h3>
                    </div>
                    <p className={clsx('text-xs line-clamp-3 leading-relaxed', isSelected ? 'text-emerald-100/80' : 'text-slate-500')}>
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100/30 flex items-center justify-between text-[11px]">
                    <span className={isSelected ? 'text-emerald-200' : 'text-slate-500 font-medium'}>
                      {count} {count === 1 ? 'Opportunity' : 'Opportunities'}
                    </span>
                    <span className={clsx('font-semibold flex items-center gap-0.5', isSelected ? 'text-maatram-gold' : 'text-maatram-primary')}>
                      Filter <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Benefits & How to Participate Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Benefits */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
            <div className="flex items-center space-x-2 text-maatram-primary">
              <Award className="w-5 h-5 text-maatram-gold" />
              <h3 className="font-bold text-base text-slate-900">
                {benefitsSection ? benefitsSection.title : 'Why Volunteer with Maatram?'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {benefitsSection ? benefitsSection.body : 'Empower underprivileged students while developing core leadership, community engagement, and professional mentorship skills.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-xs font-bold text-slate-900">Verified Contribution Hours</p>
                <p className="text-[11px] text-slate-500">Every hour checked-in and finalized by Maatram Admin enters your official record.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-xs font-bold text-slate-900">Tamper-Proof Certificates</p>
                <p className="text-[11px] text-slate-500">Issued with unique verification codes (e.g. VERIFY-M1-0001) for resume validation.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-xs font-bold text-slate-900">Alumni Corporate Attribution</p>
                <p className="text-[11px] text-slate-500">Professional recognition linked with TCS, Zoho, Infosys, and partner employers.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-xs font-bold text-slate-900">Activity Coordination Groups</p>
                <p className="text-[11px] text-slate-500">Direct WhatsApp-like team coordination with pinned rubrics and announcements.</p>
              </div>
            </div>
          </div>

          {/* How to Participate */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
            <div className="flex items-center space-x-2 text-maatram-primary">
              <Sparkles className="w-5 h-5 text-maatram-gold" />
              <h3 className="font-bold text-base text-slate-900">
                {howToSection ? howToSection.title : 'How Participation Works'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Structured four-step process ensuring quality execution and transparent administrative approvals.
            </p>
            <div className="space-y-3 pt-1">
              {[
                { step: '01', title: 'Browse & Register', desc: 'Select active opportunities matching your interest. Submit registration before deadline.' },
                { step: '02', title: 'Availability & Admin Confirmation', desc: 'Confirm availability when prompted. Admin reviews eligibility and confirms team participation.' },
                { step: '03', title: 'Group Coordination', desc: 'Join the linked coordination group, review agendas, acknowledge briefings, and access resources.' },
                { step: '04', title: 'Attendance & Certified Hours', desc: 'Check-in on event day. Hours are audited, verified, and issued certificates are unlocked in your portal.' },
              ].map((item) => (
                <div key={item.step} className="flex items-start space-x-3 text-xs">
                  <span className="w-6 h-6 rounded-md bg-emerald-100 text-maatram-primary font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                    {item.step}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="text-[11px] text-slate-500 leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Opportunities Discovery Section */}
        <section id="opportunities-section" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-maatram-primary">Live Engagement</p>
              <h2 className="text-2xl font-extrabold text-slate-900">Open Opportunities</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">
                Showing {filteredActivities.length} of {activities.length} activities
              </span>
              {selectedCategory !== 'ALL' && (
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className="text-xs font-semibold text-rose-600 hover:underline px-2 py-1 bg-rose-50 rounded"
                >
                  Clear Category Filter
                </button>
              )}
            </div>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200 space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No open opportunities in this category right now.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Check back shortly or view other categories. Admin routinely publishes opportunities for school sessions and admissions.
              </p>
              <button
                onClick={() => setSelectedCategory('ALL')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
              >
                Show All Opportunities
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((activity) => {
                const category = categories.find(c => c.category_id === activity.category_id);
                const registration = getRegistrationForActivity(activity.activity_id);
                const approvedCount = storage.getRegistrationsForActivity(activity.activity_id)
                  .filter(r => r.status === 'APPROVED').length;
                const capacityLeft = Math.max(0, activity.capacity - approvedCount);

                return (
                  <div
                    key={activity.activity_id}
                    className="bg-white rounded-xl border border-slate-200/90 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      {/* Top Bar */}
                      <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-maatram-primary bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {category ? category.category_name : activity.category_id}
                        </span>
                        <StatusBadge status={activity.status} type="activity" />
                      </div>

                      {/* Body */}
                      <div className="p-5 space-y-3.5">
                        <h3 className="font-bold text-base text-slate-900 group-hover:text-maatram-primary transition-colors leading-snug">
                          {activity.title}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {activity.description}
                        </p>

                        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{activity.start_date} ({activity.start_time} – {activity.end_time})</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{activity.location} • <strong className="font-semibold text-slate-800">{activity.mode}</strong></span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>Deadline: <strong className="font-semibold text-slate-700">{activity.registration_deadline}</strong></span>
                          </div>
                        </div>

                        {/* Capacity meter */}
                        <div className="pt-2">
                          <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
                            <span>Capacity Status</span>
                            <span className={capacityLeft <= 2 ? 'text-amber-600 font-bold' : 'text-slate-700'}>
                              {approvedCount} / {activity.capacity} confirmed ({capacityLeft} remaining)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={clsx(
                                'h-full rounded-full transition-all',
                                capacityLeft === 0 ? 'bg-rose-500' : capacityLeft <= 2 ? 'bg-amber-500' : 'bg-maatram-primary'
                              )}
                              style={{ width: `${Math.min(100, (approvedCount / activity.capacity) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      {registration ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-500">My Status:</span>
                          <StatusBadge status={registration.status} type="registration" />
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">
                          {capacityLeft === 0 ? 'Waitlist available' : 'Open for registration'}
                        </span>
                      )}

                      {registration ? (
                        <Link
                          to="/my-workspace"
                          className="text-xs font-bold text-maatram-primary hover:underline flex items-center gap-1"
                        >
                          <span>View in Workspace</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <button
                          onClick={() => setApplyingActivity(activity)}
                          className="px-4 py-1.5 rounded-lg bg-maatram-primary hover:bg-maatram-hover text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                        >
                          <span>Register Now</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Contact Office Callout Bar */}
        <section className="bg-emerald-900 text-white rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-card">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="text-lg font-bold">Need assistance with your volunteer schedule?</h3>
            <p className="text-xs text-emerald-200 max-w-xl">
              Our central office coordination team is available to assist with opportunity eligibility, attendance disputes, or certificate verification.
            </p>
          </div>
          <button
            onClick={() => setContactModalOpen(true)}
            className="px-5 py-2.5 bg-maatram-gold hover:bg-maatram-gold-dark text-slate-900 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Open Contact Desk</span>
          </button>
        </section>
      </div>

      {/* Registration Confirmation Modal */}
      {applyingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-elevated border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-maatram-primary">Confirm Registration</span>
              <h3 className="text-base font-bold text-slate-900">{applyingActivity.title}</h3>
              <p className="text-xs text-slate-500">
                {applyingActivity.start_date} • {applyingActivity.location} ({applyingActivity.mode})
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-semibold text-slate-900">{currentUser.full_name} ({currentUser.role})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Affiliation:</span>
                <span className="font-semibold text-slate-900">{currentUser.employer_org || currentUser.department_or_batch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registration Policy:</span>
                <span className="font-medium text-emerald-700">Subject to Admin capacity review</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500">
              By confirming, your application will be routed to the Office Admin. Once approved, you will be invited to the activity coordination group.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setApplyingActivity(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApply(applyingActivity)}
                className="px-4 py-2 rounded-lg bg-maatram-primary hover:bg-maatram-hover text-white text-xs font-semibold"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Office Contact Modal */}
      <OfficeContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
    </div>
  );
};
