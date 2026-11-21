import React, { useState } from 'react';
import { useStorage, useCurrentUser } from '../../hooks/useStorage';
import { Activity, ActivityMode, ActivityStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { OpportunityCreateEditModal } from './OpportunityCreateEditModal';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Award, 
  Plus, 
  Edit3, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Eye
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export const OpportunityListPage: React.FC = () => {
  const storage = useStorage();
  const [currentUser] = useCurrentUser();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedMode, setSelectedMode] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [viewingActivity, setViewingActivity] = useState<Activity | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isAdmin = currentUser.role === 'ADMIN';
  const categories = storage.getCategories();
  const activities = storage.getActivities();
  const userRegistrations = storage.getRegistrationsForUser(currentUser.user_id);

  // Filter pipeline
  const filteredActivities = activities.filter((act) => {
    // Non-admin can only see PUBLISHED or IN_PROGRESS opportunities (or ones they already completed/joined)
    if (!isAdmin && act.status === 'DRAFT') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = act.title.toLowerCase().includes(q);
      const matchDesc = act.description.toLowerCase().includes(q);
      const matchLoc = act.location.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc) return false;
    }

    if (selectedCategory !== 'ALL' && act.category_id !== selectedCategory) {
      return false;
    }

    if (selectedMode !== 'ALL' && act.mode !== selectedMode) {
      return false;
    }

    if (selectedStatus !== 'ALL' && act.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  const handleRegister = (activity: Activity) => {
    const res = storage.registerForActivity(activity.activity_id, currentUser.user_id);
    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
    setViewingActivity(null);
    setTimeout(() => setFeedback(null), 5000);
  };

  const getMyRegistration = (actId: string) => {
    return userRegistrations.find((r) => r.activity_id === actId && r.status !== 'REJECTED');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast alert */}
      {feedback && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top duration-200">
          <div
            className={clsx(
              'flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-elevated border text-xs font-semibold',
              feedback.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : 'bg-rose-900 text-white border-rose-700'
            )}
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-300" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-300" />
            )}
            <span>{feedback.text}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-maatram-primary mb-1">
            <Calendar className="w-4 h-4" />
            <span>Volunteering Directory</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {isAdmin ? 'Activity & Opportunity Management' : 'Discover Volunteer Opportunities'}
          </h1>
          <p className="text-xs text-slate-500">
            {isAdmin
              ? 'Create, publish, monitor capacity, and manage lifecycles across all 5 volunteering categories.'
              : 'Explore verified student mentorship, school outreach, and interview evaluation opportunities.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setEditingActivity(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-maatram-primary hover:bg-maatram-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Opportunity</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, location, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-maatram-primary"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-maatram-primary text-slate-700"
          >
            <option value="ALL">All Volunteering Categories</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Mode Filter */}
        <div>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-maatram-primary text-slate-700"
          >
            <option value="ALL">All Modes (Online & Offline)</option>
            <option value="OFFLINE">OFFLINE (In-person)</option>
            <option value="ONLINE">ONLINE (Remote)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-maatram-primary text-slate-700"
          >
            <option value="ALL">All Lifecycle Statuses</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="REGISTRATION_CLOSED">REGISTRATION_CLOSED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="ARCHIVED">ARCHIVED</option>
            {isAdmin && <option value="DRAFT">DRAFT</option>}
          </select>
        </div>
      </div>

      {/* Grid of Opportunities */}
      {filteredActivities.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No matching opportunities found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or filters to discover active opportunities.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSelectedMode('ALL');
              setSelectedStatus('ALL');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => {
            const category = categories.find((c) => c.category_id === activity.category_id);
            const myReg = getMyRegistration(activity.activity_id);
            const approvedCount = storage
              .getRegistrationsForActivity(activity.activity_id)
              .filter((r) => r.status === 'APPROVED').length;
            const capacityLeft = Math.max(0, activity.capacity - approvedCount);

            return (
              <div
                key={activity.activity_id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Card Header */}
                  <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-maatram-primary bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {category ? category.category_name : activity.category_id}
                    </span>
                    <StatusBadge status={activity.status} type="activity" />
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base text-slate-900 leading-snug">
                        {activity.title}
                      </h3>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setEditingActivity(activity);
                            setIsModalOpen(true);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex-shrink-0"
                          title="Edit Opportunity"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {activity.description}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>
                          {activity.start_date} ({activity.start_time} – {activity.end_time})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">
                          {activity.location} • <strong className="font-semibold text-slate-800">{activity.mode}</strong>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>
                          Deadline: <strong className="font-semibold text-slate-700">{activity.registration_deadline}</strong>
                        </span>
                      </div>
                      {activity.certificate_enabled === 'Yes' && (
                        <div className="flex items-center space-x-2 text-emerald-700 font-medium">
                          <Award className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>Includes Verified Certificate</span>
                        </div>
                      )}
                    </div>

                    {/* Capacity Indicator */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
                        <span>Capacity</span>
                        <span className={capacityLeft <= 2 ? 'text-amber-600 font-bold' : 'text-slate-700'}>
                          {approvedCount} / {activity.capacity} confirmed ({capacityLeft} spots left)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={clsx(
                            'h-full rounded-full transition-all',
                            capacityLeft === 0
                              ? 'bg-rose-500'
                              : capacityLeft <= 2
                              ? 'bg-amber-500'
                              : 'bg-maatram-primary'
                          )}
                          style={{ width: `${Math.min(100, (approvedCount / activity.capacity) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  {isAdmin ? (
                    <>
                      <Link
                        to={`/admin/activities/${activity.activity_id}`}
                        className="text-xs font-bold text-maatram-primary hover:underline flex items-center gap-1"
                      >
                        <span>8-Tab Activity Hub</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => {
                          setEditingActivity(activity);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded border border-slate-200"
                      >
                        Edit
                      </button>
                    </>
                  ) : (
                    <>
                      {myReg ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs text-slate-500">My Status:</span>
                          <StatusBadge status={myReg.status} type="registration" />
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">
                          {capacityLeft === 0 ? 'Waitlist open' : 'Open for registration'}
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewingActivity(activity)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                        >
                          Details
                        </button>
                        {!myReg && activity.status === 'PUBLISHED' && (
                          <button
                            onClick={() => handleRegister(activity)}
                            className="px-3.5 py-1.5 rounded-lg bg-maatram-primary hover:bg-maatram-hover text-white text-xs font-semibold shadow-sm"
                          >
                            Register
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Opportunity Details & Registration Modal */}
      {viewingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-elevated border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-maatram-primary bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  {categories.find((c) => c.category_id === viewingActivity.category_id)?.category_name}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{viewingActivity.title}</h3>
              </div>
              <button onClick={() => setViewingActivity(null)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <span className="sr-only">Close</span>✕
              </button>
            </div>

            <div className="text-xs text-slate-700 space-y-3">
              <p className="leading-relaxed">{viewingActivity.description}</p>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-semibold text-slate-900">
                    {viewingActivity.start_date} ({viewingActivity.start_time} – {viewingActivity.end_time})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location / Mode:</span>
                  <span className="font-semibold text-slate-900">
                    {viewingActivity.location} ({viewingActivity.mode})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coordinator:</span>
                  <span className="font-semibold text-slate-900">{viewingActivity.coordinator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registration Deadline:</span>
                  <span className="font-semibold text-slate-900">{viewingActivity.registration_deadline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Certificate:</span>
                  <span className="font-semibold text-emerald-800">
                    {viewingActivity.certificate_enabled === 'Yes' ? 'Issued upon verification' : 'None'}
                  </span>
                </div>
              </div>

              {/* Eligibility explanation */}
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-900 text-[11px] space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Eligibility Status: Active Scholar / Supporter Profile
                </p>
                <p>
                  You are eligible to apply as <strong>{currentUser.full_name}</strong> ({currentUser.role}). All registrations are reviewed and confirmed by the Office Admin.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setViewingActivity(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {!getMyRegistration(viewingActivity.activity_id) && viewingActivity.status === 'PUBLISHED' && (
                <button
                  onClick={() => handleRegister(viewingActivity)}
                  className="px-4 py-2 rounded-lg bg-maatram-primary hover:bg-maatram-hover text-white text-xs font-semibold"
                >
                  Confirm Registration
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Create/Edit Modal */}
      <OpportunityCreateEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activityToEdit={editingActivity}
      />
    </div>
  );
};
