import React, { useState, useEffect } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { Activity, ActivityMode, ActivityStatus } from '../../types';
import { X, Calendar, MapPin, Clock, Award, Users, Save } from 'lucide-react';

interface OpportunityCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityToEdit?: Activity | null;
  onSaved?: (activity: Activity) => void;
}

export const OpportunityCreateEditModal: React.FC<OpportunityCreateEditModalProps> = ({
  isOpen,
  onClose,
  activityToEdit,
  onSaved,
}) => {
  const storage = useStorage();
  const categories = storage.getCategories();

  const [formData, setFormData] = useState<Omit<Activity, 'activity_id'>>({
    title: '',
    category_id: 'CAT01',
    description: '',
    start_date: '',
    start_time: '09:30',
    end_date: '',
    end_time: '13:00',
    mode: 'OFFLINE',
    location: '',
    capacity: 10,
    status: 'PUBLISHED',
    registration_deadline: '',
    certificate_enabled: 'Yes',
    coordinator: 'Office Admin',
  });

  useEffect(() => {
    if (activityToEdit) {
      setFormData({
        title: activityToEdit.title,
        category_id: activityToEdit.category_id,
        description: activityToEdit.description,
        start_date: activityToEdit.start_date,
        start_time: activityToEdit.start_time,
        end_date: activityToEdit.end_date,
        end_time: activityToEdit.end_time,
        mode: activityToEdit.mode,
        location: activityToEdit.location,
        capacity: activityToEdit.capacity,
        status: activityToEdit.status,
        registration_deadline: activityToEdit.registration_deadline,
        certificate_enabled: activityToEdit.certificate_enabled,
        coordinator: activityToEdit.coordinator,
      });
    } else {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];

      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 4);
      const deadlineStr = deadline.toISOString().split('T')[0];

      setFormData({
        title: '',
        category_id: 'CAT01',
        description: '',
        start_date: nextWeekStr,
        start_time: '09:30',
        end_date: nextWeekStr,
        end_time: '13:00',
        mode: 'OFFLINE',
        location: 'Maatram Office, Chennai',
        capacity: 10,
        status: 'PUBLISHED',
        registration_deadline: deadlineStr,
        certificate_enabled: 'Yes',
        coordinator: 'Office Admin',
      });
    }
  }, [activityToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activityToEdit) {
      const updated: Activity = {
        ...formData,
        activity_id: activityToEdit.activity_id,
      };
      storage.updateActivity(updated);
      onSaved?.(updated);
    } else {
      const created = storage.createActivity(formData);
      onSaved?.(created);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-elevated border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-maatram-primary px-6 py-4 flex items-center justify-between text-white flex-shrink-0">
          <div>
            <h2 className="text-base font-bold">
              {activityToEdit ? `Edit Opportunity (${activityToEdit.activity_id})` : 'Create New Opportunity'}
            </h2>
            <p className="text-xs text-white/80">Configure schedule, eligibility, capacity, and certificate policy</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Opportunity Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-maatram-primary font-medium"
              placeholder="e.g. Government Higher Secondary Career Session"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Volunteering Category *</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-maatram-primary"
              >
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.category_name} ({c.category_id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Lifecycle Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ActivityStatus })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-maatram-primary font-semibold"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED (Discoverable)</option>
                <option value="REGISTRATION_CLOSED">REGISTRATION_CLOSED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="PENDING_FINALIZATION">PENDING_FINALIZATION</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description & Scope *</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-maatram-primary"
              placeholder="Outline specific objectives, volunteer responsibilities, and expected impact..."
            />
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Start Time *</label>
              <input
                type="time"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">End Time *</label>
              <input
                type="time"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          {/* Mode & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Participation Mode *</label>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="OFFLINE"
                    checked={formData.mode === 'OFFLINE'}
                    onChange={() => setFormData({ ...formData, mode: 'OFFLINE' })}
                    className="text-maatram-primary focus:ring-maatram-primary"
                  />
                  <span className="font-medium text-slate-800">OFFLINE (In-person)</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="ONLINE"
                    checked={formData.mode === 'ONLINE'}
                    onChange={() => setFormData({ ...formData, mode: 'ONLINE' })}
                    className="text-maatram-primary focus:ring-maatram-primary"
                  />
                  <span className="font-medium text-slate-800">ONLINE (Remote)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Location / Meeting URL *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
                placeholder="e.g. Government School, Salem OR Online Google Meet"
              />
            </div>
          </div>

          {/* Capacity, Deadline & Certificates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Volunteer Capacity *</label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Registration Deadline *</label>
              <input
                type="date"
                required
                value={formData.registration_deadline}
                onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Certificate Enabled *</label>
              <select
                value={formData.certificate_enabled}
                onChange={(e) => setFormData({ ...formData, certificate_enabled: e.target.value as 'Yes' | 'No' })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              >
                <option value="Yes">Yes (Issues Certificate)</option>
                <option value="No">No (Hours only)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-maatram-primary hover:bg-maatram-hover text-white font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{activityToEdit ? 'Save Changes' : 'Create Opportunity'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
