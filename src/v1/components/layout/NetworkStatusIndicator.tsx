import React from "react";
import useNetworkStatus from "../../hooks/useNetworkStatus";

const NetworkStatusIndicator: React.FC = () => {
  const isOnline = useNetworkStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white text-center p-1 z-50">
      You are currently offline. Please check your internet connection or server
      status.
    </div>
  );
};

export default NetworkStatusIndicator;
