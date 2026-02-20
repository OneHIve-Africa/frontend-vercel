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
    return <AdminSettingsPage />;
  }
  return <SettingsPage />;
};

// Static router definition
const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/otp-verify", element: <OtpVerifyPage /> },
  { path: "/new-password", element: <NewPasswordPage /> },
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
        // For admin, settings is a direct page. For investor, it's a layout with children.
        // We handle this by checking the role and rendering the appropriate component structure.
        // However, since their children structure differs in the original code, 
        // we'll map them explicitly to avoid conflict.
        
        // Strategy: We list all potential routes here. ProtectedRoute guards the parent.
        // But for "settings", the structure is different.
        // Admin: /settings -> AdminSettingsPage
        // Investor: /settings -> SettingsPage (layout) -> children
        
        // To keep it simple, we use a wrapper for the /settings route
        element: <RoleBasedSettings />,
        children: [
          // Investor settings children
          { index: true, element: <Navigate to="profile" replace /> },
          { path: "profile", element: <ProfileInformation /> },
          { path: "notifications", element: <NotificationPreferences /> },
          { path: "account", element: <AccountActions /> },
        ]
      },

      // Investor Routes
      { path: "portfolio", element: <PortfolioPage /> },
      { path: "impact", element: <ImpactPage /> },
      { path: "financial-performance", element: <FinancialPerformancePage /> },
      {
        path: "notification",
        element: <NotificationLayout />,
        children: [
          { index: true, element: <Navigate to="category/Investment" replace /> },
          { path: "category/:key", element: <NotificationsPage /> },
          { path: "message/:id", element: <NotificationDetailPage /> },
        ],
      },
      { path: "feedback", element: <FeedbackPage /> },
      { path: "resources", element: <ResourcesPage /> },

      // Admin Routes
      { path: "dashboard", element: <Dashboard /> },
      { path: "farmers", element: <FarmersPage /> },
      { path: "investors", element: <Investors /> },
      { path: "beehives", element: <Beehives /> },
      { path: "finance", element: <Finance /> },
      { path: "records", element: <Records /> },
      // Note: "resources" and "impact" paths collide. 
      // "resources" is handled by the Investor route above (ResourcesPage).
      // If Admin needs a different Resources page, logic is needed.
      // Based on original code:
      // Investor: path: "resources", element: <ResourcesPage />
      // Admin:    path: "resources", element: <Resources />
      // Resolution: We need a RoleBasedResources component.
      
      { 
        path: "communication",
        element: <CommunicationLayout />,
        children: [
          { index: true, element: <NotificationsPage /> },
          { path: "messages", element: <Messages /> },
        ],
      },
      // Colliding paths handled via specific routes or conditional rendering:
      // 1. Impact
      // Investor: path: "impact", element: <ImpactPage />
      // Admin:    path: "impact", element: <Impact /> (Admin feature)
      // Since they share the path "impact", we need a RoleBasedImpact component.
    ]
  },
  { path: "*", element: <PageNotFound /> },
]);

// Helper for Resources collision
const RoleBasedResourcesHelper = () => {
    const { profile } = useUserProfileStore();
    return profile?.position === "Administrator" ? <Resources /> : <ResourcesPage />;
};

// Helper for Impact collision
const RoleBasedImpactHelper = () => {
    const { profile } = useUserProfileStore();
    return profile?.position === "Administrator" ? <Impact /> : <ImpactPage />;
};

// Patching the router with the helpers
const routes = router.routes[9].children!; // The "/" children
// Find and replace "resources"
const resRoute = routes.find(r => r.path === "resources") as any;
if (resRoute) resRoute.element = <RoleBasedResourcesHelper />;
// Find and replace "impact" 
const impactRoute = routes.find(r => r.path === "impact") as any;
if (impactRoute) impactRoute.element = <RoleBasedImpactHelper />;


const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;

