import {
  User,
  Category,
  Activity,
  Registration,
  Availability,
  VolunteerGroup,
  GroupMessage,
  AttendanceRecord,
  Certificate,
  UserPreferences,
  HubSection,
  DashboardKPIs,
  RegistrationStatus,
  AvailabilityResponseType,
  InvitationStatus,
  AttendanceStatus,
  ActivityStatus,
} from '../types';

import {
  SEED_USERS,
  SEED_CATEGORIES,
  SEED_ACTIVITIES,
  SEED_REGISTRATIONS,
  SEED_AVAILABILITY,
  SEED_GROUPS,
  SEED_MESSAGES,
  SEED_ATTENDANCE,
  SEED_CERTIFICATES,
  SEED_PREFERENCES,
  SEED_HUB_SECTIONS,
} from '../data/seedData';

const STORAGE_KEYS = {
  USERS: 'maatram_users_v1',
  CURRENT_USER_ID: 'maatram_current_user_id_v1',
  CATEGORIES: 'maatram_categories_v1',
  ACTIVITIES: 'maatram_activities_v1',
  REGISTRATIONS: 'maatram_registrations_v1',
  AVAILABILITY: 'maatram_availability_v1',
  GROUPS: 'maatram_groups_v1',
  MESSAGES: 'maatram_messages_v1',
  ATTENDANCE: 'maatram_attendance_v1',
  CERTIFICATES: 'maatram_certificates_v1',
  PREFERENCES: 'maatram_preferences_v1',
  HUB_SECTIONS: 'maatram_hub_sections_v1',
};

// Event dispatcher for cross-component reactive updates
class StorageEventEmitter extends EventTarget {
  emitChange() {
    this.dispatchEvent(new Event('storage-updated'));
  }
}
export const storageEvents = new StorageEventEmitter();

function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err);
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    storageEvents.emitChange();
  } catch (err) {
    console.error(`Error writing ${key} to localStorage`, err);
  }
}

export const storageService = {
  // Initialization & Reset
  init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.resetToSeedData();
    }
    // Default logged in user to Office Admin or Student if not set
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'U011');
    }
  },

  resetToSeedData(): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'U011');
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(SEED_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(SEED_ACTIVITIES));
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(SEED_REGISTRATIONS));
    localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(SEED_AVAILABILITY));
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(SEED_GROUPS));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(SEED_MESSAGES));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(SEED_ATTENDANCE));
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(SEED_CERTIFICATES));
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(SEED_PREFERENCES));
    localStorage.setItem(STORAGE_KEYS.HUB_SECTIONS, JSON.stringify(SEED_HUB_SECTIONS));
    storageEvents.emitChange();
  },

  // USERS
  getUsers(): User[] {
    return getStoredItem<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
  },

  getUserById(userId: string): User | undefined {
    return this.getUsers().find((u) => u.user_id === userId);
  },

  getCurrentUser(): User {
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'U011';
    const user = this.getUserById(currentId);
    return user || SEED_USERS.find((u) => u.user_id === 'U011')!;
  },

  setCurrentUser(userId: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    storageEvents.emitChange();
  },

  updateUser(updated: User): void {
    const users = this.getUsers().map((u) => (u.user_id === updated.user_id ? updated : u));
    setStoredItem(STORAGE_KEYS.USERS, users);
  },

  createUser(userData: Omit<User, 'user_id' | 'volunteer_since'>): User {
    const users = this.getUsers();
    const nextNum = users.length + 1;
    const newId = `U${String(nextNum).padStart(3, '0')}`;
    const newUser: User = {
      ...userData,
      user_id: newId,
      volunteer_since: new Date().toISOString().split('T')[0],
    };
    users.push(newUser);
    setStoredItem(STORAGE_KEYS.USERS, users);
    
    // Also init preferences
    const prefs = this.getPreferencesList();
    prefs.push({
      user_id: newId,
      notify_enabled: 'Yes',
      preferred_category_ids: 'CAT01;CAT02',
      email_updates: 'Yes',
      volunteer_dnc: 'No',
      admin_dnc: 'No',
      linkedin_consent: 'No',
    });
    setStoredItem(STORAGE_KEYS.PREFERENCES, prefs);
    return newUser;
  },

  // CATEGORIES
  getCategories(): Category[] {
    return getStoredItem<Category[]>(STORAGE_KEYS.CATEGORIES, SEED_CATEGORIES);
  },

  // ACTIVITIES & OPPORTUNITIES
  getActivities(): Activity[] {
    return getStoredItem<Activity[]>(STORAGE_KEYS.ACTIVITIES, SEED_ACTIVITIES);
  },

  getActivityById(activityId: string): Activity | undefined {
    return this.getActivities().find((a) => a.activity_id === activityId);
  },

  createActivity(data: Omit<Activity, 'activity_id'>): Activity {
    const activities = this.getActivities();
    const nextNum = activities.length + 1;
    const newId = `A${String(nextNum).padStart(3, '0')}`;
    const newActivity: Activity = {
      ...data,
      activity_id: newId,
    };
    activities.push(newActivity);
    setStoredItem(STORAGE_KEYS.ACTIVITIES, activities);

    // Automatically create a linked volunteer group
    const groups = this.getGroups();
    const newGroup: VolunteerGroup = {
      group_id: `G${String(groups.length + 1).padStart(3, '0')}`,
      activity_id: newId,
      group_name: data.title,
      group_type: 'ACTIVITY',
      created_at: `${new Date().toISOString().split('T')[0]} 10:00`,
      status: 'ACTIVE',
      created_by: 'U011',
    };
    groups.push(newGroup);
    setStoredItem(STORAGE_KEYS.GROUPS, groups);

    return newActivity;
  },

  updateActivity(updated: Activity): void {
    const activities = this.getActivities().map((a) =>
      a.activity_id === updated.activity_id ? updated : a
    );
    setStoredItem(STORAGE_KEYS.ACTIVITIES, activities);
  },

  updateActivityStatus(activityId: string, newStatus: ActivityStatus): void {
    const activity = this.getActivityById(activityId);
    if (!activity) return;
    this.updateActivity({ ...activity, status: newStatus });
  },

  // REGISTRATIONS
  getRegistrations(): Registration[] {
    return getStoredItem<Registration[]>(STORAGE_KEYS.REGISTRATIONS, SEED_REGISTRATIONS);
  },

  getRegistrationsForActivity(activityId: string): Registration[] {
    return this.getRegistrations().filter((r) => r.activity_id === activityId);
  },

  getRegistrationsForUser(userId: string): Registration[] {
    return this.getRegistrations().filter((r) => r.user_id === userId);
  },

  registerForActivity(activityId: string, userId: string): { success: boolean; message: string; registration?: Registration } {
    const registrations = this.getRegistrations();
    const activity = this.getActivityById(activityId);
    if (!activity) {
      return { success: false, message: 'Activity not found.' };
    }

    // Duplicate check
    const existing = registrations.find(
      (r) => r.activity_id === activityId && r.user_id === userId && r.status !== 'REJECTED'
    );
    if (existing) {
      return { success: false, message: 'You have already registered for this opportunity.' };
    }

    // Check capacity
    const approvedCount = registrations.filter((r) => r.activity_id === activityId && r.status === 'APPROVED').length;
    const isFull = approvedCount >= activity.capacity;

    const nextId = `R${String(registrations.length + 1).padStart(3, '0')}`;
    const now = new Date();
    const dateStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newRegistration: Registration = {
      registration_id: nextId,
      activity_id: activityId,
      user_id: userId,
      applied_at: dateStr,
      status: isFull ? 'WAITLISTED' : 'PENDING',
      admin_note: isFull ? 'Capacity reached; placed on waitlist automatically.' : undefined,
    };

    registrations.push(newRegistration);
    setStoredItem(STORAGE_KEYS.REGISTRATIONS, registrations);
    return { 
      success: true, 
      message: isFull ? 'Capacity reached. You have been added to the waitlist.' : 'Registration submitted successfully for Admin approval.',
      registration: newRegistration,
    };
  },

  updateRegistrationStatus(registrationId: string, status: RegistrationStatus, adminNote?: string): void {
    const registrations = this.getRegistrations().map((r) => {
      if (r.registration_id === registrationId) {
        const now = new Date();
        const dateStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        return {
          ...r,
          status,
          reviewed_by: 'U011',
          reviewed_at: dateStr,
          admin_note: adminNote !== undefined ? adminNote : r.admin_note,
        };
      }
      return r;
    });
    setStoredItem(STORAGE_KEYS.REGISTRATIONS, registrations);
  },

  // AVAILABILITY & INVITATIONS
  getAvailability(): Availability[] {
    return getStoredItem<Availability[]>(STORAGE_KEYS.AVAILABILITY, SEED_AVAILABILITY);
  },

  getAvailabilityForActivity(activityId: string): Availability[] {
    return this.getAvailability().filter((a) => a.activity_id === activityId);
  },

  getAvailabilityForUser(userId: string): Availability[] {
    return this.getAvailability().filter((a) => a.user_id === userId);
  },

  requestAvailability(activityId: string, userId: string): void {
    const list = this.getAvailability();
    const existing = list.find((a) => a.activity_id === activityId && a.user_id === userId);
    const now = new Date();
    const dateStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (existing) {
      existing.request_sent_at = dateStr;
    } else {
      list.push({
        response_id: `AV${String(list.length + 1).padStart(3, '0')}`,
        activity_id: activityId,
        user_id: userId,
        request_sent_at: dateStr,
        response: 'PENDING',
        invitation_status: 'NOT_SENT',
      });
    }
    setStoredItem(STORAGE_KEYS.AVAILABILITY, list);
  },

  respondAvailability(responseId: string, response: AvailabilityResponseType): void {
    const list = this.getAvailability().map((a) => {
      if (a.response_id === responseId) {
        const now = new Date();
        return {
          ...a,
          response,
          responded_at: `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        };
      }
      return a;
    });
    setStoredItem(STORAGE_KEYS.AVAILABILITY, list);
  },

  updateInvitationStatus(responseId: string, invitationStatus: InvitationStatus): void {
    const list = this.getAvailability().map((a) => {
      if (a.response_id === responseId) {
        return { ...a, invitation_status: invitationStatus };
      }
      return a;
    });
    setStoredItem(STORAGE_KEYS.AVAILABILITY, list);
  },

  // VOLUNTEER GROUPS & MESSAGES
  getGroups(): VolunteerGroup[] {
    return getStoredItem<VolunteerGroup[]>(STORAGE_KEYS.GROUPS, SEED_GROUPS);
  },

  getGroupById(groupId: string): VolunteerGroup | undefined {
    return this.getGroups().find((g) => g.group_id === groupId);
  },

  getGroupByActivityId(activityId: string): VolunteerGroup | undefined {
    return this.getGroups().find((g) => g.activity_id === activityId);
  },

  getMessages(): GroupMessage[] {
    return getStoredItem<GroupMessage[]>(STORAGE_KEYS.MESSAGES, SEED_MESSAGES);
  },

  getMessagesForGroup(groupId: string): GroupMessage[] {
    return this.getMessages().filter((m) => m.group_id === groupId);
  },

  sendMessage(groupId: string, senderId: string, messageText: string, messageType: 'TEXT' | 'ANNOUNCEMENT' = 'TEXT', demoAttachment?: string): GroupMessage {
    const messages = this.getMessages();
    const now = new Date();
    const dateStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newMsg: GroupMessage = {
      message_id: `M${String(messages.length + 1).padStart(3, '0')}`,
      group_id: groupId,
      sender_id: senderId,
      message_type: messageType,
      message_text: messageText,
      sent_at: dateStr,
      pinned: 'No',
      demo_attachment: demoAttachment,
      acknowledgements: [],
    };
    messages.push(newMsg);
    setStoredItem(STORAGE_KEYS.MESSAGES, messages);
    return newMsg;
  },

  togglePinMessage(messageId: string): void {
    const messages = this.getMessages().map((m) => {
      if (m.message_id === messageId) {
        return { ...m, pinned: m.pinned === 'Yes' ? 'No' : 'Yes' as ('Yes' | 'No') };
      }
      return m;
    });
    setStoredItem(STORAGE_KEYS.MESSAGES, messages);
  },

  acknowledgeMessage(messageId: string, userId: string): void {
    const messages = this.getMessages().map((m) => {
      if (m.message_id === messageId) {
        const acks = m.acknowledgements ? [...m.acknowledgements] : [];
        if (!acks.includes(userId)) {
          acks.push(userId);
        }
        return { ...m, acknowledgements: acks };
      }
      return m;
    });
    setStoredItem(STORAGE_KEYS.MESSAGES, messages);
  },

  // ATTENDANCE & HOURS
  getAttendance(): AttendanceRecord[] {
    return getStoredItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, SEED_ATTENDANCE);
  },

  getAttendanceForActivity(activityId: string): AttendanceRecord[] {
    return this.getAttendance().filter((a) => a.activity_id === activityId);
  },

  getAttendanceForUser(userId: string): AttendanceRecord[] {
    return this.getAttendance().filter((a) => a.user_id === userId);
  },

  saveAttendanceRecord(record: Omit<AttendanceRecord, 'attendance_id'> & { attendance_id?: string }): AttendanceRecord {
    const attendance = this.getAttendance();
    let saved: AttendanceRecord;

    if (record.attendance_id) {
      attendance.forEach((item, index) => {
        if (item.attendance_id === record.attendance_id) {
          attendance[index] = record as AttendanceRecord;
          saved = record as AttendanceRecord;
        }
      });
    } else {
      const nextId = `AT${String(attendance.length + 1).padStart(3, '0')}`;
      saved = {
        ...record,
        attendance_id: nextId,
      };
      attendance.push(saved);
    }

    setStoredItem(STORAGE_KEYS.ATTENDANCE, attendance);
    return saved!;
  },

  finalizeAttendance(attendanceId: string, hoursVerified: number, reason?: string): void {
    const attendance = this.getAttendance().map((a) => {
      if (a.attendance_id === attendanceId) {
        return {
          ...a,
          hours_verified: hoursVerified,
          verification_status: 'FINALIZED' as const,
          verified_by: 'U011',
          correction_reason: reason || a.correction_reason,
        };
      }
      return a;
    });
    setStoredItem(STORAGE_KEYS.ATTENDANCE, attendance);
  },

  // CERTIFICATES
  getCertificates(): Certificate[] {
    return getStoredItem<Certificate[]>(STORAGE_KEYS.CERTIFICATES, SEED_CERTIFICATES);
  },

  getCertificatesForUser(userId: string): Certificate[] {
    return this.getCertificates().filter((c) => c.user_id === userId);
  },

  getCertificatesForActivity(activityId: string): Certificate[] {
    return this.getCertificates().filter((c) => c.activity_id === activityId);
  },

  issueCertificate(activityId: string, userId: string): Certificate {
    const certificates = this.getCertificates();
    const existing = certificates.find((c) => c.activity_id === activityId && c.user_id === userId);
    const dateStr = new Date().toISOString().split('T')[0];
    const certNum = `M1-2026-${String(certificates.length + 1).padStart(4, '0')}`;
    const verifyCode = `VERIFY-${certNum}`;

    if (existing) {
      existing.issue_status = 'ISSUED';
      existing.issued_on = dateStr;
      existing.delivery_status = 'DELIVERED';
      existing.certificate_number = certNum;
      existing.verification_code = verifyCode;
      setStoredItem(STORAGE_KEYS.CERTIFICATES, certificates);
      return existing;
    } else {
      const newCert: Certificate = {
        certificate_id: `C${String(certificates.length + 1).padStart(3, '0')}`,
        activity_id: activityId,
        user_id: userId,
        certificate_number: certNum,
        issue_status: 'ISSUED',
        issued_on: dateStr,
        delivery_status: 'DELIVERED',
        verification_code: verifyCode,
      };
      certificates.push(newCert);
      setStoredItem(STORAGE_KEYS.CERTIFICATES, certificates);
      return newCert;
    }
  },

  // PREFERENCES & DNC
  getPreferencesList(): UserPreferences[] {
    return getStoredItem<UserPreferences[]>(STORAGE_KEYS.PREFERENCES, SEED_PREFERENCES);
  },

  getPreferencesForUser(userId: string): UserPreferences {
    const list = this.getPreferencesList();
    const pref = list.find((p) => p.user_id === userId);
    if (pref) return pref;
    const defaultPref: UserPreferences = {
      user_id: userId,
      notify_enabled: 'Yes',
      preferred_category_ids: 'CAT01;CAT02',
      email_updates: 'Yes',
      volunteer_dnc: 'No',
      admin_dnc: 'No',
      linkedin_consent: 'No',
    };
    list.push(defaultPref);
    setStoredItem(STORAGE_KEYS.PREFERENCES, list);
    return defaultPref;
  },

  updatePreferences(pref: UserPreferences): void {
    const list = this.getPreferencesList().map((p) => (p.user_id === pref.user_id ? pref : p));
    setStoredItem(STORAGE_KEYS.PREFERENCES, list);
  },

  // VOLUNTEER HUB CMS
  getHubSections(): HubSection[] {
    return getStoredItem<HubSection[]>(STORAGE_KEYS.HUB_SECTIONS, SEED_HUB_SECTIONS)
      .sort((a, b) => a.display_order - b.display_order);
  },

  updateHubSection(updated: HubSection): void {
    const sections = this.getHubSections().map((s) => (s.id === updated.id ? updated : s));
    setStoredItem(STORAGE_KEYS.HUB_SECTIONS, sections);
  },

  createHubSection(data: Omit<HubSection, 'id'>): HubSection {
    const sections = this.getHubSections();
    const newSection: HubSection = {
      ...data,
      id: `SEC${String(sections.length + 1).padStart(2, '0')}`,
    };
    sections.push(newSection);
    setStoredItem(STORAGE_KEYS.HUB_SECTIONS, sections);
    return newSection;
  },

  deleteHubSection(id: string): void {
    const sections = this.getHubSections().filter((s) => s.id !== id);
    setStoredItem(STORAGE_KEYS.HUB_SECTIONS, sections);
  },

  // CALCULATED METRICS FOR DASHBOARD
  getDashboardKPIs(): DashboardKPIs {
    const users = this.getUsers().filter((u) => u.role !== 'ADMIN');
    const activities = this.getActivities();
    const registrations = this.getRegistrations();
    const attendance = this.getAttendance();
    const certificates = this.getCertificates();
    const groups = this.getGroups();

    // 1. Total volunteers: distinct active Student, Alumni and Supporter profiles (excludes Admin)
    const total_volunteers = users.filter((u) => u.account_status === 'ACTIVE').length;

    // 2. Active opportunities: published or in-progress
    const active_opportunities = activities.filter(
      (a) => a.status === 'PUBLISHED' || a.status === 'IN_PROGRESS'
    ).length;

    // 3. Pending registrations
    const pending_registrations = registrations.filter((r) => r.status === 'PENDING').length;

    // 4. Waitlisted registrations
    const waitlisted_registrations = registrations.filter((r) => r.status === 'WAITLISTED').length;

    // 5. Completed activities (marked COMPLETED or ARCHIVED)
    const completed_activities = activities.filter(
      (a) => a.status === 'COMPLETED' || a.status === 'ARCHIVED'
    ).length;

    // 6. Verified volunteer hours: sum of finalized verified hours in Attendance
    const verified_volunteer_hours = attendance
      .filter((a) => a.verification_status === 'FINALIZED')
      .reduce((sum, item) => sum + (Number(item.hours_verified) || 0), 0);

    // 7. Certificates issued: status ISSUED
    const certificates_issued = certificates.filter((c) => c.issue_status === 'ISSUED').length;

    // 8. Volunteers requiring inactivity review: status INACTIVE_REVIEW
    const volunteers_requiring_inactivity_review = this.getUsers().filter(
      (u) => u.account_status === 'INACTIVE_REVIEW'
    ).length;

    // 9. Active volunteer groups: ACTIVE status
    const active_volunteer_groups = groups.filter((g) => g.status === 'ACTIVE').length;

    return {
      total_volunteers,
      active_opportunities,
      pending_registrations,
      waitlisted_registrations,
      completed_activities,
      verified_volunteer_hours: Number(verified_volunteer_hours.toFixed(2)),
      certificates_issued,
      volunteers_requiring_inactivity_review,
      active_volunteer_groups,
    };
  },
};

// Initialize once when module loads
storageService.init();
