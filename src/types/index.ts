export type UserRole = 'STUDENT' | 'ALUMNI' | 'SUPPORTER' | 'ADMIN';

export type AccountStatus = 'ACTIVE' | 'INACTIVE_REVIEW' | 'SUSPENDED';

export interface User {
  user_id: string;
  full_name: string;
  role: UserRole;
  email: string;
  phone_demo: string;
  department_or_batch: string;
  graduation_year?: number | null;
  employer_org?: string | null;
  skills: string;
  account_status: AccountStatus;
  volunteer_since: string;
}

export interface Category {
  category_id: string;
  category_name: string;
  description: string;
  active: 'Yes' | 'No';
}

export type ActivityStatus = 
  | 'DRAFT'
  | 'PUBLISHED'
  | 'REGISTRATION_CLOSED'
  | 'IN_PROGRESS'
  | 'PENDING_FINALIZATION'
  | 'COMPLETED'
  | 'ARCHIVED';

export type ActivityMode = 'OFFLINE' | 'ONLINE';

export interface Activity {
  activity_id: string;
  title: string;
  category_id: string;
  description: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  mode: ActivityMode;
  location: string;
  capacity: number;
  status: ActivityStatus;
  registration_deadline: string;
  certificate_enabled: 'Yes' | 'No';
  coordinator: string;
}

export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'WAITLISTED' | 'REJECTED' | 'COMPLETED';

export interface Registration {
  registration_id: string;
  activity_id: string;
  user_id: string;
  applied_at: string;
  status: RegistrationStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  admin_note?: string;
}

export type AvailabilityResponseType = 'AVAILABLE' | 'UNAVAILABLE' | 'MAYBE' | 'PENDING';
export type InvitationStatus = 'NOT_SENT' | 'SENT' | 'CONFIRMED' | 'DECLINED';

export interface Availability {
  response_id: string;
  activity_id: string;
  user_id: string;
  request_sent_at: string;
  response: AvailabilityResponseType;
  responded_at?: string;
  invitation_status: InvitationStatus;
}

export type GroupType = 'ACTIVITY' | 'GENERAL' | 'SPECIAL';
export type GroupStatus = 'ACTIVE' | 'CLOSED';

export interface VolunteerGroup {
  group_id: string;
  activity_id: string;
  group_name: string;
  group_type: GroupType;
  created_at: string;
  status: GroupStatus;
  created_by: string;
}

export type MessageType = 'ANNOUNCEMENT' | 'TEXT';

export interface GroupMessage {
  message_id: string;
  group_id: string;
  sender_id: string;
  message_type: MessageType;
  message_text: string;
  sent_at: string;
  pinned: 'Yes' | 'No';
  demo_attachment?: string;
  acknowledgements?: string[]; // user_ids who acknowledged
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'PENDING';
export type VerificationStatus = 'FINALIZED' | 'NOT_FINALIZED';

export interface AttendanceRecord {
  attendance_id: string;
  activity_id: string;
  user_id: string;
  attendance_status: AttendanceStatus;
  check_in?: string;
  check_out?: string;
  hours_calculated: number;
  hours_verified: number;
  verification_status: VerificationStatus;
  verified_by?: string;
  correction_reason?: string;
}

export type CertificateIssueStatus = 'ISSUED' | 'ELIGIBILITY_PENDING' | 'REVOKED';
export type CertificateDeliveryStatus = 'DELIVERED' | 'NOT_READY';

export interface Certificate {
  certificate_id: string;
  activity_id: string;
  user_id: string;
  certificate_number?: string;
  issue_status: CertificateIssueStatus;
  issued_on?: string;
  delivery_status: CertificateDeliveryStatus;
  verification_code?: string;
}

export interface UserPreferences {
  user_id: string;
  notify_enabled: 'Yes' | 'No';
  preferred_category_ids: string; // "CAT01;CAT02"
  email_updates: 'Yes' | 'No';
  volunteer_dnc: 'Yes' | 'No';
  admin_dnc: 'Yes' | 'No';
  dnc_reason?: string;
  linkedin_consent: 'Yes' | 'No';
}

export interface HubSection {
  id: string;
  title: string;
  subtitle?: string;
  body: string;
  display_order: number;
  is_published: boolean;
  section_type: 'INTRO' | 'BENEFITS' | 'AREAS' | 'HOW_TO' | 'OFFICE_CONTACT';
}

export interface DashboardKPIs {
  total_volunteers: number;
  active_opportunities: number;
  pending_registrations: number;
  waitlisted_registrations: number;
  completed_activities: number;
  verified_volunteer_hours: number;
  certificates_issued: number;
  volunteers_requiring_inactivity_review: number;
  active_volunteer_groups: number;
}
