import React, { useState } from 'react';
import { useStorage, useCurrentUser } from '../../hooks/useStorage';
import { UserPreferences } from '../../types';
import { 
  Settings, 
  Bell, 
  Mail, 
  ShieldAlert, 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Lock, 
  Sparkles,
  Send,
  HelpCircle,
  Eye
} from 'lucide-react';
import clsx from 'clsx';

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.69 1.69 0 0 0 0-3.38 1.69 1.69 0 0 0 0 3.38m1.39 9.74v-8.37H5.07v8.37h2.78z" />
  </svg>
);

export const PreferencesPage: React.FC = () => {
  const storage = useStorage();
  const [currentUser] = useCurrentUser();
  const isAdmin = currentUser.role === 'ADMIN';

  // For Admin, allow inspecting/editing any user's preferences, or own
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.user_id);
  const users = storage.getUsers();
  const categories = storage.getCategories();

  const userPref = storage.getPreferencesForUser(selectedUserId);
  const [formData, setFormData] = useState<UserPreferences>(userPref);
  const [toast, setToast] = useState<string | null>(null);

  // Appreciation email & LinkedIn preview modals
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [showLinkedInPreview, setShowLinkedInPreview] = useState(false);

  // Sync when selected user changes
  React.useEffect(() => {
    setFormData(storage.getPreferencesForUser(selectedUserId));
  }, [selectedUserId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCategoryToggle = (catId: string) => {
    const current = formData.preferred_category_ids
      ? formData.preferred_category_ids.split(';').filter(Boolean)
      : [];
    let updated: string[];
    if (current.includes(catId)) {
      updated = current.filter((c) => c !== catId);
    } else {
      updated = [...current, catId];
    }
    setFormData({ ...formData, preferred_category_ids: updated.join(';') });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updatePreferences(formData);
    showToast('Preferences and communication settings saved successfully!');
  };

  const targetUser = users.find((u) => u.user_id === selectedUserId) || currentUser;

  // Dual-source DNC check
  const isVolunteerDnc = formData.volunteer_dnc === 'Yes';
  const isAdminDnc = formData.admin_dnc === 'Yes';
  const isContactBlocked = isVolunteerDnc || isAdminDnc;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top duration-200">
          <div className="bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-elevated border border-emerald-700 flex items-center space-x-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-maatram-primary mb-1">
            <Settings className="w-4 h-4" />
            <span>Preferences & Governance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Communication & Privacy Preferences</h1>
          <p className="text-xs text-slate-500">
            Control opportunity alerts, category subscriptions, Do Not Contact restrictions, and social recognition.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-semibold text-slate-600">Managing User:</span>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-800"
            >
              {users.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {u.full_name} ({u.role} - {u.user_id})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Dual-Source DNC Policy Banner */}
      <div
        className={clsx(
          'p-4 rounded-xl border flex items-start gap-3 text-xs',
          isContactBlocked
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        )}
      >
        <ShieldAlert
          className={clsx('w-5 h-5 flex-shrink-0 mt-0.5', isContactBlocked ? 'text-rose-600' : 'text-emerald-600')}
        />
        <div className="space-y-1">
          <p className="font-bold">
            {isContactBlocked
              ? 'DO NOT CONTACT (DNC) RESTRICTION ACTIVE'
              : 'COMMUNICATION STATUS: ACTIVE & DELIVERABLE'}
          </p>
          <p className="leading-relaxed text-[11px]">
            {isContactBlocked ? (
              <>
                All optional communications, email alerts, appreciation messages, and invitation broadcasts are{' '}
                <strong>strictly blocked</strong> for this profile.
                {isVolunteerDnc && <span className="block mt-0.5">• Volunteer requested DNC: "{formData.dnc_reason || 'Opted out'}"</span>}
                {isAdminDnc && <span className="block mt-0.5">• Admin applied restriction: "{formData.dnc_reason || 'Administrative restriction'}"</span>}
              </>
            ) : (
              'Volunteer has opted in to receive opportunity notifications and team updates based on category preferences.'
            )}
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Preferred Volunteering Categories */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Preferred Volunteering Categories</h3>
              <p className="text-xs text-slate-500">Select categories you wish to receive alerts and availability requests for</p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {formData.preferred_category_ids.split(';').filter(Boolean).length} / 5 Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => {
              const isChecked = formData.preferred_category_ids.split(';').includes(cat.category_id);
              return (
                <label
                  key={cat.category_id}
                  className={clsx(
                    'p-3.5 rounded-lg border flex items-start space-x-3 cursor-pointer transition-colors text-xs',
                    isChecked
                      ? 'bg-emerald-50/60 border-emerald-300 text-slate-900'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCategoryToggle(cat.category_id)}
                    className="rounded border-slate-300 text-maatram-primary focus:ring-maatram-primary mt-0.5"
                  />
                  <div>
                    <p className="font-bold text-slate-900">{cat.category_name}</p>
                    <p className="text-[11px] text-slate-500 leading-snug">{cat.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Notifications & Channels */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Notification Channels</h3>
            <p className="text-xs text-slate-500">Configure how and when the platform contacts you</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-maatram-primary" />
                  Opportunity Subscriptions & Push Alerts
                </p>
                <p className="text-slate-500 text-[11px]">
                  Receive notifications when new opportunities matching your preferred categories are published
                </p>
              </div>
              <select
                value={formData.notify_enabled}
                onChange={(e) => setFormData({ ...formData, notify_enabled: e.target.value as 'Yes' | 'No' })}
                className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold"
              >
                <option value="Yes">Enabled (Yes)</option>
                <option value="No">Disabled (No)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  Email Digest & Activity Briefings
                </p>
                <p className="text-slate-500 text-[11px]">
                  Receive calendar invites, orientation pdfs, and session confirmation emails
                </p>
              </div>
              <select
                value={formData.email_updates}
                onChange={(e) => setFormData({ ...formData, email_updates: e.target.value as 'Yes' | 'No' })}
                className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold"
              >
                <option value="Yes">Enabled (Yes)</option>
                <option value="No">Disabled (No)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Do Not Contact (DNC) Governance */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Do Not Contact (DNC) Restrictions</h3>
            <p className="text-xs text-slate-500">
              Dual-source restriction model: volunteer-originated or Admin-applied restrictions immediately block optional communications.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Volunteer DNC */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Volunteer-Requested Do Not Contact</p>
                  <p className="text-[11px] text-slate-500">
                    Set directly by the volunteer to temporarily pause all optional outreach
                  </p>
                </div>
                <select
                  value={formData.volunteer_dnc}
                  onChange={(e) => setFormData({ ...formData, volunteer_dnc: e.target.value as 'Yes' | 'No' })}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold"
                >
                  <option value="No">No (Standard Contact)</option>
                  <option value="Yes">Yes (Do Not Contact)</option>
                </select>
              </div>
            </div>

            {/* Admin DNC (Only Admin can toggle) */}
            {isAdmin && (
              <div className="p-3.5 rounded-lg bg-rose-50/60 border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-rose-950 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-rose-700" />
                      Admin-Applied Contact Restriction
                    </p>
                    <p className="text-[11px] text-rose-800">
                      Administrative freeze applied during inactivity review or conduct holds
                    </p>
                  </div>
                  <select
                    value={formData.admin_dnc}
                    onChange={(e) => setFormData({ ...formData, admin_dnc: e.target.value as 'Yes' | 'No' })}
                    className="px-3 py-1.5 rounded-lg border border-rose-300 font-semibold bg-white"
                  >
                    <option value="No">No (Unrestricted)</option>
                    <option value="Yes">Yes (Admin Restriction)</option>
                  </select>
                </div>
              </div>
            )}

            {/* DNC Reason */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Restriction Justification / Audit Reason
              </label>
              <input
                type="text"
                value={formData.dnc_reason || ''}
                onChange={(e) => setFormData({ ...formData, dnc_reason: e.target.value })}
                placeholder="e.g. Volunteer requested no optional contact OR Admin restriction pending review"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Public Recognition & LinkedIn Preview */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Volunteer Recognition & Public Social Sharing</h3>
              <p className="text-xs text-slate-500">Preview generated appreciation emails and ready-to-post LinkedIn highlights</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowEmailPreview(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Appreciation Email Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setShowLinkedInPreview(true)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-semibold rounded-lg border border-blue-200 flex items-center gap-1.5"
              >
                <LinkedInIcon className="w-3.5 h-3.5 text-blue-700" />
                <span>LinkedIn Post Preview</span>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-900">Voluntary LinkedIn Recognition Consent</p>
              <p className="text-slate-500 text-[11px]">
                Allow Maatram to prepare official shareable snippets highlighting your verified volunteering hours
              </p>
            </div>
            <select
              value={formData.linkedin_consent}
              onChange={(e) => setFormData({ ...formData, linkedin_consent: e.target.value as 'Yes' | 'No' })}
              className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold"
            >
              <option value="Yes">Consent Granted (Yes)</option>
              <option value="No">No Consent (No)</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-maatram-primary hover:bg-maatram-hover text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences & Settings</span>
          </button>
        </div>
      </form>

      {/* Appreciation Email Preview Modal */}
      {showEmailPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-elevated border border-slate-200 max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Appreciation Email Preview</h3>
              </div>
              <button onClick={() => setShowEmailPreview(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 font-sans text-slate-800">
              <div className="space-y-1 border-b border-slate-200 pb-2 text-[11px] text-slate-500">
                <p><strong>From:</strong> Maatram Foundation Office &lt;admin@maatram.example.test&gt;</p>
                <p><strong>To:</strong> {targetUser.full_name} &lt;{targetUser.email}&gt;</p>
                <p><strong>Subject:</strong> Thank you for your certified contribution with Maatram Foundation!</p>
              </div>

              <div className="space-y-2 text-xs leading-relaxed">
                <p>Dear {targetUser.full_name},</p>
                <p>
                  On behalf of the students, trustees, and coordinating team at Maatram Foundation, we extend our heartfelt gratitude for your dedicated volunteering service.
                </p>
                <p>
                  Your verified hours have been audited and officially archived in your volunteer portfolio. Your mentorship directly shapes the future of deserving young scholars across Tamil Nadu.
                </p>
                <p className="pt-2 font-semibold">
                  With warm regards,<br />
                  Maatram Foundation Coordination Team
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEmailPreview(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LinkedIn Post Preview Modal */}
      {showLinkedInPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-elevated border border-slate-200 max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <LinkedInIcon className="w-4 h-4 text-blue-700" />
                <h3 className="font-bold text-sm text-slate-900">LinkedIn Post Draft Preview</h3>
              </div>
              <button onClick={() => setShowLinkedInPreview(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 text-slate-800 shadow-sm">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                  {targetUser.full_name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{targetUser.full_name}</p>
                  <p className="text-[10px] text-slate-500">
                    {targetUser.employer_org || targetUser.department_or_batch} • 1st
                  </p>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-slate-700">
                Proud to volunteer with @Maatram Foundation! Dedicated structured hours supporting student career guidance, admissions panels, and skill enablement for first-generation scholars.
                <br /><br />
                Every hour counts towards transforming student journeys across Tamil Nadu. 🎓✨
                <br /><br />
                #MaatramFoundation #SocialImpact #Volunteering #HigherEducation #GivingBack
              </p>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center space-y-1">
                <p className="font-bold text-maatram-primary text-xs">Maatram One — Certified Volunteering Record</p>
                <p className="text-[10px] text-slate-400 font-mono">Issued by Maatram Foundation Office</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-slate-400">Prototype preview only (no actual post sent)</span>
              <button
                onClick={() => {
                  showToast('LinkedIn copy copied to clipboard!');
                  setShowLinkedInPreview(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
              >
                Copy Post Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
