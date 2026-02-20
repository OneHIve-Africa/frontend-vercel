/* eslint-disable @typescript-eslint/no-unused-vars */
import { ReactNode } from "react";
import { useAuthStore } from "../features/auth/store/AuthStore";
import { useUserProfileStore } from "../features/auth/store/UserProfileStore";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isFirstTime } = useAuthStore();
  const { profile } = useUserProfileStore();

  console.log("[ProtectedDebug] Checking auth. Authenticated:", isAuthenticated, "Profile:", profile?.position);

  if (isAuthenticated === undefined) {
    return (
      <div>
        <div className="flex items-center justify-center h-screen w-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-oha.primary"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("[ProtectedDebug] Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (isFirstTime && profile?.position != "Administrator") {
    console.log("[ProtectedDebug] First time user, redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
