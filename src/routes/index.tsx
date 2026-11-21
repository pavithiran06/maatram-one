import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useStorage';
import { AppShell } from '../components/layout/AppShell';

// Auth Pages
import { SignInPage } from '../features/auth/SignInPage';
import { SignUpPage } from '../features/auth/SignUpPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';

// Volunteer Experiences
import { VolunteerHubPage } from '../features/volunteer-hub/VolunteerHubPage';
import { VolunteerWorkspacePage } from '../features/volunteer-workspace/VolunteerWorkspacePage';
import { VolunteerCertificatesView } from '../features/certificates/VolunteerCertificatesView';

// Common / Shared Features
import { OpportunityListPage } from '../features/opportunities/OpportunityListPage';
import { VolunteerGroupsPage } from '../features/groups/VolunteerGroupsPage';
import { PreferencesPage } from '../features/preferences/PreferencesPage';

// Admin Experiences
import { AdminDashboardPage } from '../features/dashboard/AdminDashboardPage';
import { ActivityDetailPage } from '../features/activities/ActivityDetailPage';
import { RegistrationManagementPage } from '../features/registrations/RegistrationManagementPage';
import { AvailabilityManagementPage } from '../features/availability/AvailabilityManagementPage';
import { AttendanceManagementPage } from '../features/attendance/AttendanceManagementPage';
import { CertificateManagementPage } from '../features/certificates/CertificateManagementPage';
import { ReportsPage } from '../features/reports/ReportsPage';
import { VolunteerHubCMS } from '../features/volunteer-hub/VolunteerHubCMS';
import { VolunteerDirectoryPage } from '../features/volunteers/VolunteerDirectoryPage';

// Root redirect based on role
const RootRedirect: React.FC = () => {
  const [currentUser] = useCurrentUser();
  if (currentUser.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/hub" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Root */}
        <Route path="/" element={<RootRedirect />} />

        {/* Volunteer & Shared Routes */}
        <Route path="/hub" element={<VolunteerHubPage />} />
        <Route path="/opportunities" element={<OpportunityListPage />} />
        <Route path="/my-workspace" element={<VolunteerWorkspacePage />} />
        <Route path="/groups" element={<VolunteerGroupsPage />} />
        <Route path="/certificates" element={<VolunteerCertificatesView />} />
        <Route path="/preferences" element={<PreferencesPage />} />

        {/* Admin Specific Routes */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/opportunities" element={<OpportunityListPage />} />
        <Route path="/admin/activities/:activityId" element={<ActivityDetailPage />} />
        <Route path="/admin/registrations" element={<RegistrationManagementPage />} />
        <Route path="/admin/availability" element={<AvailabilityManagementPage />} />
        <Route path="/admin/groups" element={<VolunteerGroupsPage />} />
        <Route path="/admin/attendance" element={<AttendanceManagementPage />} />
        <Route path="/admin/certificates" element={<CertificateManagementPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
        <Route path="/admin/hub-cms" element={<VolunteerHubCMS />} />
        <Route path="/admin/volunteers" element={<VolunteerDirectoryPage />} />

        {/* Auth Prototype Routes */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
