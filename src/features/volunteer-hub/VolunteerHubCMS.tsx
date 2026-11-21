import React, { useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { HubSection } from '../../types';
import { 
  FileEdit, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  Save, 
  Layout, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export const VolunteerHubCMS: React.FC = () => {
  const storage = useStorage();
  const [sections, setSections] = useState<HubSection[]>(() => storage.getHubSections());
  const [editingSection, setEditingSection] = useState<HubSection | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const categories = storage.getCategories();

  const handleTogglePublish = (section: HubSection) => {
    const updated = { ...section, is_published: !section.is_published };
    storage.updateHubSection(updated);
    setSections(storage.getHubSections());
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const current = newSections[index];
    const target = newSections[targetIndex];

    const tempOrder = current.display_order;
    current.display_order = target.display_order;
    target.display_order = tempOrder;

    storage.updateHubSection(current);
    storage.updateHubSection(target);
    setSections(storage.getHubSections());
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;
    storage.updateHubSection(editingSection);
    setSections(storage.getHubSections());
    setEditingSection(null);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;
    storage.createHubSection({
      title: editingSection.title,
      subtitle: editingSection.subtitle,
      body: editingSection.body,
      display_order: sections.length + 1,
      is_published: true,
      section_type: editingSection.section_type || 'INTRO',
    });
    setSections(storage.getHubSections());
    setEditingSection(null);
    setIsCreating(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this section permanently?')) {
      storage.deleteHubSection(id);
      setSections(storage.getHubSections());
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {saveToast && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top duration-200">
          <div className="bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-elevated border border-emerald-700 flex items-center space-x-2 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span>Volunteer Hub content updated and published live!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-maatram-primary mb-1">
            <Layout className="w-4 h-4" />
            <span>Content Management System</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Volunteer Hub CMS</h1>
          <p className="text-xs text-slate-500">
            Manage public messaging, educational context, benefits, and display order visible to Students and Alumni.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/hub"
            target="_blank"
            className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Live Preview</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
          <button
            onClick={() => {
              setIsCreating(true);
              setEditingSection({
                id: '',
                title: '',
                subtitle: '',
                body: '',
                display_order: sections.length + 1,
                is_published: true,
                section_type: 'INTRO',
              });
            }}
            className="px-4 py-2 rounded-lg bg-maatram-primary hover:bg-maatram-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Section</span>
          </button>
        </div>
      </div>

      {/* Sections Table & Manager */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Configured Hub Sections</h2>
            <p className="text-xs text-slate-500">Ordered sequence as displayed on the post-login landing screen</p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {sections.filter(s => s.is_published).length} Published / {sections.length} Total
          </span>
        </div>

        <div className="divide-y divide-slate-200">
          {sections.map((section, idx) => (
            <div key={section.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start space-x-3.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-maatram-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-100">
                  {section.display_order}
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{section.title}</h3>
                    <span className={clsx(
                      'text-[10px] px-2 py-0.5 rounded font-semibold border',
                      section.is_published
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    )}>
                      {section.is_published ? 'Published' : 'Draft / Hidden'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {section.section_type}
                    </span>
                  </div>
                  {section.subtitle && (
                    <p className="text-xs text-slate-600 font-medium">{section.subtitle}</p>
                  )}
                  <p className="text-xs text-slate-500 line-clamp-2 max-w-2xl">{section.body}</p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center space-x-1.5 flex-shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleMoveOrder(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMoveOrder(idx, 'down')}
                  disabled={idx === sections.length - 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleTogglePublish(section)}
                  className={clsx(
                    'p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors',
                    section.is_published
                      ? 'border-slate-200 text-slate-700 hover:bg-slate-100'
                      : 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  )}
                  title={section.is_published ? 'Unpublish' : 'Publish'}
                >
                  {section.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingSection(section);
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
                  title="Edit Section"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(section.id)}
                  className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                  title="Delete Section"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editing / Creating Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={isCreating ? handleCreateNew : handleSaveEdit}
            className="bg-white rounded-xl shadow-elevated border border-slate-200 max-w-xl w-full p-6 space-y-4"
          >
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {isCreating ? 'Create Hub Section' : `Edit Section (${editingSection.id})`}
              </h3>
              <p className="text-xs text-slate-500">Configure messaging displayed on the volunteer homepage</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Section Type</label>
                <select
                  value={editingSection.section_type}
                  onChange={(e) => setEditingSection({ ...editingSection, section_type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-maatram-primary"
                >
                  <option value="INTRO">Introduction / Hero</option>
                  <option value="BENEFITS">Why Volunteer / Benefits</option>
                  <option value="AREAS">Pillars & Areas</option>
                  <option value="HOW_TO">How to Participate Workflow</option>
                  <option value="OFFICE_CONTACT">Office Contact Information</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Heading Title</label>
                <input
                  type="text"
                  required
                  value={editingSection.title}
                  onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-maatram-primary"
                  placeholder="e.g. Empower Youth Through Purposeful Volunteering"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={editingSection.subtitle || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-maatram-primary"
                  placeholder="e.g. Connecting Students, Alumni, and Supporters"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Content Body (Markdown/Text)</label>
                <textarea
                  rows={4}
                  required
                  value={editingSection.body}
                  onChange={(e) => setEditingSection({ ...editingSection, body: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-maatram-primary"
                  placeholder="Provide concise, inspiring, and professional copy..."
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="publish_checkbox"
                  checked={editingSection.is_published}
                  onChange={(e) => setEditingSection({ ...editingSection, is_published: e.target.checked })}
                  className="rounded border-slate-300 text-maatram-primary focus:ring-maatram-primary"
                />
                <label htmlFor="publish_checkbox" className="font-semibold text-slate-700 select-none">
                  Publish immediately to volunteer portal
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-maatram-primary hover:bg-maatram-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isCreating ? 'Create Section' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
