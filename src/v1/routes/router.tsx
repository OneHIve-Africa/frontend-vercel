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
import { lazy, Suspense } from "react";
import PageLoader from "../components/common/PageLoader";
import { useUserProfileStore } from "../features/auth/store/UserProfileStore";
import SettingsPage from "../features/settings/features/SettingsPage";
import ProfileInformation from "../features/settings/components/ProfileInformation";
import NotificationPreferences from "../features/settings/components/NotificationPreferences";
import AccountActions from "../features/settings/components/AccountActions";

// Lazy loaded secondary & admin modules
const FeedbackPage = lazy(() => import("../features/feedback/features").then(m => ({ default: m.FeedbackPage })));
const ResourcesPage = lazy(() => import("../features/resources/features/ResourcesPage"));
const FinancialPerformancePage = lazy(() => import("../features/financial-performance/features").then(m => ({ default: m.FinancialPerformancePage })));

const Dashboard = lazy(() => import("../features/admin/features/dashboard/features").then(m => ({ default: m.Dashboard })));
const FarmersPage = lazy(() => import("../features/admin/features/farmers/features").then(m => ({ default: m.FarmersPage })));
const Investors = lazy(() => import("../features/admin/features/investors/features").then(m => ({ default: m.Investors })));
const Beehives = lazy(() => import("../features/admin/features/beehives/features").then(m => ({ default: m.Beehives })));
const Finance = lazy(() => import("../features/admin/features/finance/features").then(m => ({ default: m.Finance })));
const Records = lazy(() => import("../features/admin/features/records/features").then(m => ({ default: m.Records })));
const AdminImpact = lazy(() => import("../features/admin/features/impact/features").then(m => ({ default: m.Impact })));
const AdminSettingsPage = lazy(() => import("../features/admin/features/settings/features").then(m => ({ default: m.SettingsPage })));
const AdminResources = lazy(() => import("../features/admin/features/resources/features").then(m => ({ default: m.Resources })));
const CommunicationLayout = lazy(() => import("../features/admin/features/communications/layout/CommunicationLayout"));
const Messages = lazy(() => import("../features/admin/features/communications/features").then(m => ({ default: m.Messages })));

import { PaymentSuccess } from "../features/dashboard/features";
import PageNotFound from "../features/404/PageNotFound";

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

// Role-based components to handle path collisions
const RoleBasedRedirect = () => {
  const { profile } = useUserProfileStore();
  
  if (profile?.position === "Administrator") {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/portfolio" replace />;
};

const RoleBasedSettings = () => {
  const { profile } = useUserProfileStore();
  
  if (profile?.position === "Administrator") {
    return withSuspense(<AdminSettingsPage />);
  }
  return <SettingsPage />;
};

const RoleBasedResourcesHelper = () => {
  const { profile } = useUserProfileStore();
  return profile?.position === "Administrator" ? withSuspense(<AdminResources />) : withSuspense(<ResourcesPage />);
};

const RoleBasedImpactHelper = () => {
  const { profile } = useUserProfileStore();
  return profile?.position === "Administrator" ? withSuspense(<AdminImpact />) : <ImpactPage />;
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
        element: <RoleBasedSettings />,
        children: [
          { index: true, element: <Navigate to="profile" replace /> },
          { path: "profile", element: <ProfileInformation /> },
          { path: "notifications", element: <NotificationPreferences /> },
          { path: "account", element: <AccountActions /> },
        ]
      },

      // Investor Routes
      { path: "portfolio", element: <PortfolioPage /> },
      { path: "impact", element: <RoleBasedImpactHelper /> },
      { path: "financial-performance", element: withSuspense(<FinancialPerformancePage />) },
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
      { path: "feedback", element: withSuspense(<FeedbackPage />) },
      { path: "resources", element: <RoleBasedResourcesHelper /> },

      // Admin Routes
      { path: "dashboard", element: withSuspense(<Dashboard />) },
      { path: "farmers", element: withSuspense(<FarmersPage />) },
      { path: "investors", element: withSuspense(<Investors />) },
      { path: "beehives", element: withSuspense(<Beehives />) },
      { path: "finance", element: withSuspense(<Finance />) },
      { path: "records", element: withSuspense(<Records />) },
      { 
        path: "communication",
        element: withSuspense(<CommunicationLayout />),
        children: [
          { index: true, element: <NotificationsPage /> },
          { path: "messages", element: withSuspense(<Messages />) },
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

