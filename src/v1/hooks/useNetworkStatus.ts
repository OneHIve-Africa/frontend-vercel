import { useState, useEffect } from "react";
import axios from "axios";

const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const checkBackend = async () => {
      try {
        // Use the base URL from your environment variables
        const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";
        await axios.get(`${baseURL}health/`);
        setIsOnline(true);
      } catch (error) {
        console.error("Backend check failed:", error);
        setIsOnline(false);
      }
    };

    // Check immediately and then every 30 seconds
    checkBackend();
    const intervalId = setInterval(checkBackend, 1800000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  return isOnline;
};

export default useNetworkStatus;
