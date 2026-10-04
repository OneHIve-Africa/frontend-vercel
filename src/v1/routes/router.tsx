import {
  Navigate,

  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import {
  ChangeSuccessPage,
  ForgotPasswordPage,
  LoginPage,
  NewPasswordPage,
  OtpVerifyPage,
} from "../features/auth/features";
import RegisterPage from "../features/auth/features/RegisterPage";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../components/layout/Layout";
import { PortfolioPage } from "../features/portfolio/features";
import { ImpactPage } from "@/v1/features/impact/features";
import {
  NotificationDetailPage,
  NotificationsPage,
} from "@/v1/features/notifications/features";
import NotificationLayout from "@/v1/features/notifications/layout/NotificationLayout";
import Onboarding from "../features/dashboard/features/Onboarding";
import NewInvestment from "../features/dashboard/features/NewInvestment";
import { FeedbackPage } from "../features/feedback/features";
import { PaymentSuccess } from "../features/dashboard/features";
import ResourcesPage from "../features/resources/features/ResourcesPage";
import PageNotFound from "../features/404/PageNotFound";
import { FarmersPage } from "../features/admin/features/farmers/features";
import { Dashboard } from "../features/admin/features/dashboard/features";
import { Investors } from "../features/admin/features/investors/features";
import { useUserProfileStore } from "../features/auth/store/UserProfileStore";
import { Beehives } from "../features/admin/features/beehives/features";
import { Finance } from "../features/admin/features/finance/features";
import { Records } from "../features/admin/features/records/features";
import { Impact } from "../features/admin/features/impact/features";
import { SettingsPage as AdminSettingsPage } from "../features/admin/features/settings/features";
import SettingsPage from "../features/settings/features/SettingsPage";
import ProfileInformation from "../features/settings/components/ProfileInformation";
import NotificationPreferences from "../features/settings/components/NotificationPreferences";
import AccountActions from "../features/settings/components/AccountActions";
import { Resources } from "../features/admin/features/resources/features";
import CommunicationLayout from "../features/admin/features/communications/layout/CommunicationLayout";
import { Messages } from "../features/admin/features/communications/features";
import { FinancialPerformancePage } from "../features/financial-performance/features";
import { FulfillmentHubsPage, FulfillmentCenterDetail } from "../features/admin/features/fulfillment";

// Role-based helper
const checkIsAdmin = (profile: any) => {
  const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
  return (
    profile?.position === "Administrator" ||
    profile?.role === "admin" ||
    role === "admin"
  );
};

// Role-based components to handle path collisions
const RoleBasedRedirect = () => {
  const { profile } = useUserProfileStore();
  
  if (checkIsAdmin(profile)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/portfolio" replace />;
};

const RoleBasedResourcesHelper = () => {
  const { profile } = useUserProfileStore();
  return checkIsAdmin(profile) ? <Resources /> : <ResourcesPage />;
};

const RoleBasedImpactHelper = () => {
  const { profile } = useUserProfileStore();
  return checkIsAdmin(profile) ? <Impact /> : <ImpactPage />;
};

// Static router definition
const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/otp-verify", element: <OtpVerifyPage /> },
  { path: "/new-password", element: <NewPasswordPage /> },
  { path: "/reset-password", element: <NewPasswordPage /> },
  { path: "/change-success", element: <ChangeSuccessPage /> },
  { path: "/onboarding", element: <Onboarding /> },
  { path: "/new-investment", element: <NewInvestment /> },
  { path: "/payment-success", element: <PaymentSuccess /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      // Shared/Role-based paths
      { index: true, element: <RoleBasedRedirect /> },
      { 
        path: "settings", 
        element: <SettingsPage />,
        children: [
          { index: true, element: <Navigate to="profile" replace /> },
          { path: "profile", element: <ProfileInformation /> },
          { path: "notifications", element: <NotificationPreferences /> },
          { path: "account", element: <AccountActions /> },
          { path: "security", element: <Navigate to="/settings/account" replace /> },
        ]
      },
      // Convenience aliases for Profile Settings
      { path: "profile", element: <Navigate to="/settings/profile" replace /> },
      { path: "profile-settings", element: <Navigate to="/settings/profile" replace /> },
      // Admin System Settings route (matching Sidebar & System Settings links)
      { path: "admin/settings", element: <AdminSettingsPage /> },

      // Investor Routes
      { path: "portfolio", element: <PortfolioPage /> },
      { path: "impact", element: <RoleBasedImpactHelper /> },
      { path: "financial-performance", element: <FinancialPerformancePage /> },
      {
        path: "notification",
        element: <NotificationLayout />,
        children: [
          { index: true, element: <Navigate to="investment-updates" replace /> },
          { path: "message/:id", element: <NotificationDetailPage /> },
          { path: "category/:key", element: <NotificationsPage /> },
          { path: ":key", element: <NotificationsPage /> },
        ],
      },
      { path: "notifications", element: <Navigate to="/notification" replace /> },
      { path: "feedback", element: <FeedbackPage /> },
      { path: "resources", element: <RoleBasedResourcesHelper /> },

      // Admin Routes
      { path: "dashboard", element: <Dashboard /> },
      { path: "farmers", element: <FarmersPage /> },
      { path: "investors", element: <Investors /> },
      { path: "beehives", element: <Beehives /> },
      { path: "finance", element: <Finance /> },
      { path: "fulfillment", element: <FulfillmentHubsPage /> },
      { path: "fulfillment/:id", element: <FulfillmentCenterDetail /> },
      { path: "records", element: <Records /> },
      { 
        path: "communication",
        element: <CommunicationLayout />,
        children: [
          { index: true, element: <NotificationsPage /> },
          { path: "messages", element: <Messages /> },
        ],
      },
    ]
  },
  { path: "*", element: <PageNotFound /> },
]);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;

