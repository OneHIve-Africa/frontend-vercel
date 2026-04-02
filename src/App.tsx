import { SidebarProvider } from "./v1/context/SidebarContext";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import LogRocket from "logrocket";
import Router from "./v1/routes/router";
import { useEffect, useRef } from "react";
import { useUserProfileStore } from "@/v1/features/auth/store/UserProfileStore";
import type { UserProfile } from "@/v1/api/UserProfileApi";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  LogRocket.init("zobx3w/onehive-hivemanager");

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  // Identify the current user to LogRocket when profile is available
  const { profile } = useUserProfileStore();
  const lastIdentified = useRef<string | null>(null);

  useEffect(() => {
    if (!profile || !profile.email) return;
    const typed = profile as UserProfile & { role?: string; position?: string };
    const currentId = typed.email; // Use email as stable user identifier
    if (lastIdentified.current === currentId) return; // avoid duplicate identify

    type UserTraits = { name?: string; email: string; role?: string };
    const traits: UserTraits = {
      name: `${typed.first_name ?? ""} ${typed.last_name ?? ""}`.trim(),
      email: typed.email,
      role: typed.position || typed.role || undefined,
    };
    LogRocket.identify(currentId, traits);
    lastIdentified.current = currentId;
  }, [profile]);
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <motion.div layout className="uid">
        <SidebarProvider>
          <Router />
        </SidebarProvider>
      </motion.div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
    </GoogleOAuthProvider>
  );
}

export default App;
