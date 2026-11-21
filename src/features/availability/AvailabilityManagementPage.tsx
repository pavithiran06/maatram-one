import React, { useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AvailabilityResponseType, InvitationStatus } from '../../types';
import { 
  Clock, 
  Send, 
  CheckCheck, 
  Search, 
  CheckCircle2, 
  Plus, 
  AlertCircle,
  HelpCircle,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export const AvailabilityManagementPage: React.FC = () => {
  const storage = useStorage();
  const [toast, setToast] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('ALL');
  const [responseFilter, setResponseFilter] = useState<'ALL' | AvailabilityResponseType>('ALL');

  // Request Availability Modal
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestActivityId, setRequestActivityId] = useState('A001');
  const [requestUserId, setRequestUserId] = useState('U001');

  const availability = storage.getAvailability();
  const activities = storage.getActivities();
  const users = storage.getUsers();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSendInvitation = (responseId: string) => {
    storage.updateInvitationStatus(responseId, 'SENT');
    showToast('Invitation dispatched to volunteer');
  };

  const handleConfirmParticipation = (responseId: string) => {
    storage.updateInvitationStatus(responseId, 'CONFIRMED');
    showToast('Volunteer participation confirmed by Admin');
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    storage.requestAvailability(requestActivityId, requestUserId);
    showToast('Availability request dispatched');
    setIsRequestModalOpen(false);
  };

  const filtered = availability.filter((a) => {
    if (selectedActivityId !== 'ALL' && a.activity_id !== selectedActivityId) return false;
    if (responseFilter !== 'ALL' && a.response !== responseFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
            <Clock className="w-4 h-4" />
            <span>Volunteer Coordination</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Availability & Invitation Pipeline</h1>
          <p className="text-xs text-slate-500">
            Dispatch availability requests, monitor responses, select alternative volunteers, and issue confirmed invitations.
          </p>
        </div>

        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="px-4 py-2 bg-maatram-primary hover:bg-maatram-hover text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Request Availability</span>
        </button>
      </div>

      {/* Info notice about rules */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong>System Rule:</strong> As defined in Specification Section 6.F, an invitation acceptance by a volunteer does not automatically finalize confirmation until the Office Admin explicitly clicks <em>Confirm Participation</em>.
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Filter by Activity</label>
          <select
            value={selectedActivityId}
            onChange={(e) => setSelectedActivityId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-maatram-primary text-slate-700"
          >
            <option value="ALL">All Activities</option>
            {activities.map((a) => (
              <option key={a.activity_id} value={a.activity_id}>
                {a.title} ({a.activity_id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Filter by Response</label>
          <select
            value={responseFilter}
            onChange={(e) => setResponseFilter(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-maatram-primary text-slate-700"
          >
            <option value="ALL">All Responses</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="UNAVAILABLE">UNAVAILABLE</option>
            <option value="MAYBE">MAYBE</option>
            <option value="PENDING">PENDING / No Response</option>
          </select>
        </div>
      </div>

      {/* Availability Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Response ID</th>
                <th className="px-5 py-3">Volunteer</th>
                <th className="px-5 py-3">Opportunity</th>
                <th className="px-5 py-3">Request Sent</th>
                <th className="px-5 py-3">Response Status</th>
                <th className="px-5 py-3">Responded At</th>
                <th className="px-5 py-3">Invitation Status</th>
                <th className="px-5 py-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const volunteer = users.find((u) => u.user_id === item.user_id);
                const act = activities.find((a) => a.activity_id === item.activity_id);

                return (
                  <tr key={item.response_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-500 font-medium">{item.response_id}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{volunteer?.full_name}</p>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-50 text-emerald-800">
                        {volunteer?.role}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{volunteer?.employer_org || volunteer?.department_or_batch}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/admin/activities/${item.activity_id}`}
                        className="font-bold text-slate-900 hover:text-maatram-primary transition-colors block"
                      >
                        {act?.title || item.activity_id}
                      </Link>
                      <p className="text-[11px] text-slate-500">{act?.start_date} • {act?.mode}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{item.request_sent_at}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={item.response} type="availability" />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{item.responded_at || 'Awaiting response'}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={item.invitation_status} type="invitation" />
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {item.invitation_status === 'NOT_SENT' && (
                        <button
                          onClick={() => handleSendInvitation(item.response_id)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-[11px] inline-flex items-center gap-1 shadow-sm"
                        >
                          <Send className="w-3 h-3" />
                          <span>Dispatch Invitation</span>
                        </button>
                      )}
                      {item.invitation_status !== 'CONFIRMED' && (
                        <button
                          onClick={() => handleConfirmParticipation(item.response_id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px] inline-flex items-center gap-1 shadow-sm"
                        >
                          <CheckCheck className="w-3 h-3" />
                          <span>Confirm Participation</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Availability Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <form onSubmit={handleCreateRequest} className="bg-white rounded-xl shadow-elevated border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-base font-bold text-slate-900">Request Volunteer Availability</h3>
              <p className="text-slate-500">Send an availability inquiry for an upcoming activity</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Activity *</label>
              <select
                value={requestActivityId}
                onChange={(e) => setRequestActivityId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              >
                {activities.map((a) => (
                  <option key={a.activity_id} value={a.activity_id}>
                    {a.title} ({a.activity_id} - {a.start_date})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Volunteer *</label>
              <select
                value={requestUserId}
                onChange={(e) => setRequestUserId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              >
                {users.filter(u => u.role !== 'ADMIN').map((u) => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.full_name} ({u.role} - {u.user_id})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-maatram-primary hover:bg-maatram-hover text-white font-semibold rounded-lg shadow-sm"
              >
                Send Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
