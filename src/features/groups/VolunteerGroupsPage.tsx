import React, { useState } from 'react';
import { useStorage, useCurrentUser } from '../../hooks/useStorage';
import { VolunteerGroup, GroupMessage, MessageType } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  MessageSquare, 
  Pin, 
  Send, 
  Paperclip, 
  FileText, 
  Video, 
  Mic, 
  CheckCheck, 
  Users, 
  Search, 
  ShieldAlert, 
  Plus, 
  Check, 
  Sparkles,
  Megaphone,
  MoreVertical,
  X,
  FileCheck2,
  Lock
} from 'lucide-react';
import clsx from 'clsx';

export const VolunteerGroupsPage: React.FC = () => {
  const storage = useStorage();
  const [currentUser] = useCurrentUser();
  const isAdmin = currentUser.role === 'ADMIN';

  const allGroups = storage.getGroups();
  const [selectedGroupId, setSelectedGroupId] = useState<string>(allGroups[0]?.group_id || 'G001');
  const [messageInput, setMessageInput] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('TEXT');
  const [mockAttachment, setMockAttachment] = useState<string | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [searchGroup, setSearchGroup] = useState('');

  // Create Group Modal for Admin
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState<'ACTIVITY' | 'GENERAL' | 'SPECIAL'>('ACTIVITY');
  const [newGroupActivityId, setNewGroupActivityId] = useState('A001');

  const selectedGroup = allGroups.find((g) => g.group_id === selectedGroupId) || allGroups[0];
  const messages = selectedGroup ? storage.getMessagesForGroup(selectedGroup.group_id) : [];
  const activities = storage.getActivities();
  const users = storage.getUsers();

  const linkedActivity = selectedGroup ? activities.find((a) => a.activity_id === selectedGroup.activity_id) : null;

  // Filter groups
  const filteredGroups = allGroups.filter((g) =>
    g.group_name.toLowerCase().includes(searchGroup.toLowerCase())
  );

  // Group members calculation
  const registrations = selectedGroup ? storage.getRegistrationsForActivity(selectedGroup.activity_id) : [];
  const memberUserIds = Array.from(new Set([
    selectedGroup?.created_by || 'U011',
    'U011',
    ...registrations.filter((r) => r.status === 'APPROVED' || r.status === 'COMPLETED').map((r) => r.user_id),
  ]));
  const groupMembers = users.filter((u) => memberUserIds.includes(u.user_id));

  const pinnedMessages = messages.filter((m) => m.pinned === 'Yes');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() && !mockAttachment) return;
    if (!selectedGroup) return;

    storage.sendMessage(
      selectedGroup.group_id,
      currentUser.user_id,
      messageInput,
      messageType,
      mockAttachment || undefined
    );
    setMessageInput('');
    setMockAttachment(null);
    setMessageType('TEXT');
  };

  const handleAcknowledge = (messageId: string) => {
    storage.acknowledgeMessage(messageId, currentUser.user_id);
  };

  const handleTogglePin = (messageId: string) => {
    storage.togglePinMessage(messageId);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const groups = storage.getGroups();
    const newId = `G${String(groups.length + 1).padStart(3, '0')}`;
    const newGroup: VolunteerGroup = {
      group_id: newId,
      activity_id: newGroupActivityId,
      group_name: newGroupName,
      group_type: newGroupType,
      created_at: new Date().toISOString().split('T')[0] + ' 10:00',
      status: 'ACTIVE',
      created_by: currentUser.user_id,
    };
    groups.push(newGroup);
    localStorage.setItem('maatram_groups_v1', JSON.stringify(groups));
    storage.sendMessage(
      newId,
      currentUser.user_id,
      `Welcome to ${newGroupName}! Official volunteer coordination starts here.`,
      'ANNOUNCEMENT'
    );
    setIsCreatingGroup(false);
    setSelectedGroupId(newId);
    setNewGroupName('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Container with WhatsApp-style dual-pane layout */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-elevated h-[82vh] flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT PANE: GROUPS LIST */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/70">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-maatram-primary" />
                <span>Coordination Groups</span>
              </h2>
              <p className="text-[11px] text-slate-500">Activity and team channels</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsCreatingGroup(true)}
                className="p-1.5 rounded-lg bg-emerald-50 text-maatram-primary hover:bg-emerald-100 border border-emerald-200"
                title="Create Group"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search groups */}
          <div className="p-3 border-b border-slate-200/60 bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchGroup}
                onChange={(e) => setSearchGroup(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-maatram-primary"
              />
            </div>
          </div>

          {/* Group Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredGroups.map((group) => {
              const msgs = storage.getMessagesForGroup(group.group_id);
              const lastMsg = msgs[msgs.length - 1];
              const isSelected = selectedGroup?.group_id === group.group_id;

              return (
                <button
                  key={group.group_id}
                  onClick={() => setSelectedGroupId(group.group_id)}
                  className={clsx(
                    'w-full text-left p-3.5 flex items-start space-x-3 transition-colors',
                    isSelected
                      ? 'bg-emerald-50/90 border-l-4 border-maatram-primary'
                      : 'hover:bg-slate-100/70 bg-white'
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-maatram-primary/10 text-maatram-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-maatram-primary/20">
                    {group.group_name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {group.group_name}
                      </span>
                      {lastMsg && (
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {lastMsg.sent_at.split(' ')[1]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-mono font-semibold px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                        {group.group_type}
                      </span>
                      {group.status === 'CLOSED' && (
                        <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-slate-200 text-slate-600">
                          CLOSED
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {lastMsg ? lastMsg.message_text : 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-2.5 bg-slate-100/80 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Encrypted group coordination workspace</span>
          </div>
        </div>

        {/* RIGHT PANE: ACTIVE CHAT STREAM */}
        {selectedGroup ? (
          <div className="flex-1 flex flex-col bg-[#F7F5F0]">
            {/* Chat Header */}
            <div className="px-6 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0 shadow-subtle">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-maatram-primary text-white font-bold text-sm flex items-center justify-center shadow-sm flex-shrink-0">
                  {selectedGroup.group_name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-900 truncate">
                      {selectedGroup.group_name}
                    </h3>
                    <StatusBadge status={selectedGroup.status} />
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {linkedActivity
                      ? `${linkedActivity.title} • ${linkedActivity.start_date}`
                      : `${groupMembers.length} active participants`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowMembers(!showMembers)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Roster ({groupMembers.length})</span>
                </button>
              </div>
            </div>

            {/* Pinned Announcements Banner */}
            {pinnedMessages.length > 0 && (
              <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-start justify-between gap-3 text-xs flex-shrink-0">
                <div className="flex items-start space-x-2 min-w-0">
                  <Pin className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5 fill-amber-700/20" />
                  <div className="min-w-0">
                    <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider block">
                      Pinned Announcement:
                    </span>
                    <p className="text-amber-950 truncate font-medium">
                      {pinnedMessages[pinnedMessages.length - 1].message_text}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-amber-700 font-bold px-1.5 py-0.5 rounded bg-amber-100 flex-shrink-0">
                  {pinnedMessages.length} Pinned
                </span>
              </div>
            )}

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">No messages in this group yet.</p>
                  <p className="text-[11px]">Send an announcement or greeting to begin coordination.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const sender = users.find((u) => u.user_id === msg.sender_id);
                  const isMe = msg.sender_id === currentUser.user_id;
                  const isAnnouncement = msg.message_type === 'ANNOUNCEMENT';
                  const hasAcknowledged = msg.acknowledgements?.includes(currentUser.user_id);
                  const acks = msg.acknowledgements || [];

                  return (
                    <div
                      key={msg.message_id}
                      className={clsx(
                        'flex flex-col max-w-xl',
                        isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                      )}
                    >
                      {/* Sender metadata */}
                      <div className="flex items-center space-x-1.5 mb-1 text-[11px] text-slate-500 px-1">
                        <span className="font-bold text-slate-700">
                          {isMe ? 'You' : sender?.full_name || msg.sender_id}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-slate-200 text-slate-700">
                          {sender?.role || 'MEMBER'}
                        </span>
                        <span className="text-[10px] text-slate-400">• {msg.sent_at}</span>
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={clsx(
                          'rounded-2xl p-4 shadow-subtle border text-xs space-y-2 relative group',
                          isAnnouncement
                            ? 'bg-amber-50/90 border-amber-300 text-slate-900 w-full sm:w-[480px]'
                            : isMe
                            ? 'bg-maatram-primary text-white border-maatram-primary'
                            : 'bg-white text-slate-800 border-slate-200'
                        )}
                      >
                        {isAnnouncement && (
                          <div className="flex items-center justify-between pb-1 border-b border-amber-200 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                            <span className="flex items-center gap-1">
                              <Megaphone className="w-3.5 h-3.5 text-amber-700" />
                              Official Announcement
                            </span>
                            {msg.pinned === 'Yes' && (
                              <span className="flex items-center gap-0.5 text-amber-700">
                                <Pin className="w-3 h-3 fill-current" /> Pinned
                              </span>
                            )}
                          </div>
                        )}

                        <p className="leading-relaxed whitespace-pre-wrap">{msg.message_text}</p>

                        {/* Demo Attachment */}
                        {msg.demo_attachment && (
                          <div
                            className={clsx(
                              'p-2.5 rounded-lg border flex items-center justify-between text-xs font-medium',
                              isMe
                                ? 'bg-white/10 border-white/20 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                            )}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <FileText className="w-4 h-4 text-maatram-gold flex-shrink-0" />
                              <span className="truncate">{msg.demo_attachment}</span>
                            </div>
                            <span className="text-[10px] underline font-bold px-2 py-0.5 rounded cursor-pointer hover:opacity-80">
                              Download Preview
                            </span>
                          </div>
                        )}

                        {/* Acknowledgement Counter / Action */}
                        <div
                          className={clsx(
                            'pt-1 flex items-center justify-between text-[11px] border-t',
                            isMe ? 'border-white/10' : 'border-slate-100'
                          )}
                        >
                          <div className="flex items-center space-x-1">
                            {acks.length > 0 ? (
                              <span
                                className={clsx(
                                  'flex items-center gap-1 font-semibold text-[10px]',
                                  isMe ? 'text-emerald-200' : 'text-emerald-700'
                                )}
                              >
                                <CheckCheck className="w-3 h-3" />
                                {acks.length} volunteer{acks.length > 1 ? 's' : ''} acknowledged
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Awaiting acknowledgement</span>
                            )}
                          </div>

                          {!isMe && (
                            <button
                              onClick={() => handleAcknowledge(msg.message_id)}
                              className={clsx(
                                'text-[10px] font-bold px-2 py-0.5 rounded border transition-colors flex items-center gap-1',
                                hasAcknowledged
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-white text-slate-700 hover:bg-emerald-50 border-slate-300'
                              )}
                            >
                              <Check className="w-3 h-3" />
                              <span>{hasAcknowledged ? 'Acknowledged' : 'Acknowledge'}</span>
                            </button>
                          )}
                        </div>

                        {/* Admin Moderation Pin / Unpin */}
                        {isAdmin && (
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleTogglePin(msg.message_id)}
                              className="p-1 rounded bg-white shadow-sm border border-slate-200 text-slate-700 hover:text-maatram-primary"
                              title={msg.pinned === 'Yes' ? 'Unpin' : 'Pin to top'}
                            >
                              <Pin className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Mock Attachment Tag if chosen */}
            {mockAttachment && (
              <div className="px-6 py-2 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                <span className="flex items-center gap-1.5 font-medium">
                  <Paperclip className="w-3.5 h-3.5 text-emerald-700" />
                  Attachment ready: <strong>{mockAttachment}</strong>
                </span>
                <button onClick={() => setMockAttachment(null)} className="text-slate-400 hover:text-slate-700">
                  ✕
                </button>
              </div>
            )}

            {/* Message Composer */}
            {selectedGroup.status === 'CLOSED' ? (
              <div className="p-4 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-500 font-medium">
                This activity group has been completed and closed. Historical messages are preserved in read-only mode.
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 space-y-2">
                {/* Admin controls for announcement */}
                {isAdmin && (
                  <div className="flex items-center space-x-4 text-xs font-semibold text-slate-600 pb-1">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Post Mode:</span>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="msgType"
                        value="TEXT"
                        checked={messageType === 'TEXT'}
                        onChange={() => setMessageType('TEXT')}
                        className="text-maatram-primary"
                      />
                      <span>Standard Message</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer text-amber-800">
                      <input
                        type="radio"
                        name="msgType"
                        value="ANNOUNCEMENT"
                        checked={messageType === 'ANNOUNCEMENT'}
                        onChange={() => setMessageType('ANNOUNCEMENT')}
                        className="text-amber-600"
                      />
                      <span className="font-bold flex items-center gap-1">
                        <Megaphone className="w-3.5 h-3.5 text-amber-600" />
                        Admin Announcement
                      </span>
                    </label>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-2 focus-within:bg-white focus-within:ring-1 focus-within:ring-maatram-primary transition-all">
                    <textarea
                      rows={2}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder={
                        messageType === 'ANNOUNCEMENT'
                          ? 'Compose official announcement (briefing, schedule, instructions)...'
                          : `Message #${selectedGroup.group_name}...`
                      }
                      className="w-full bg-transparent text-xs resize-none focus:outline-none text-slate-800"
                    />
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-slate-400">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setMockAttachment('session-orientation-guide.pdf')}
                          className="hover:text-slate-700 p-1 rounded"
                          title="Attach Document"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setMockAttachment('coordination-briefing-audio.mp3')}
                          className="hover:text-slate-700 p-1 rounded"
                          title="Attach Audio Briefing"
                        >
                          <Mic className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setMockAttachment('venue-directions-video.mp4')}
                          className="hover:text-slate-700 p-1 rounded"
                          title="Attach Short Video"
                        >
                          <Video className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400">Press Enter or Send</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="p-3 rounded-xl bg-maatram-primary hover:bg-maatram-hover text-white shadow-sm flex-shrink-0 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-12 text-slate-400">
            Select a group to start communicating.
          </div>
        )}

        {/* Members Sidebar Slide-out */}
        {showMembers && (
          <div className="w-72 bg-white border-l border-slate-200 p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-maatram-primary" />
                <span>Group Roster ({groupMembers.length})</span>
              </h4>
              <button onClick={() => setShowMembers(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {groupMembers.map((member) => (
                <div key={member.user_id} className="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{member.full_name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-emerald-100 text-emerald-800">
                      {member.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {member.employer_org || member.department_or_batch}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {isCreatingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <form onSubmit={handleCreateGroup} className="bg-white rounded-xl shadow-elevated border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-base font-bold text-slate-900">Create Volunteer Group</h3>
              <p className="text-slate-500">Establish an activity coordination or special volunteer channel</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Group Name *</label>
              <input
                type="text"
                required
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g. School Visit – Core Team"
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Group Type *</label>
              <select
                value={newGroupType}
                onChange={(e) => setNewGroupType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              >
                <option value="ACTIVITY">ACTIVITY (Linked to scheduled event)</option>
                <option value="GENERAL">GENERAL (Ongoing coordination)</option>
                <option value="SPECIAL">SPECIAL (Special project or interview leads)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Link to Activity</label>
              <select
                value={newGroupActivityId}
                onChange={(e) => setNewGroupActivityId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              >
                {activities.map((a) => (
                  <option key={a.activity_id} value={a.activity_id}>
                    {a.title} ({a.activity_id})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreatingGroup(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-maatram-primary hover:bg-maatram-hover text-white font-semibold"
              >
                Create Group
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
