import React from "react";

export const PageLoader: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center gap-3 p-8">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-amber-200 border-t-oha_primary animate-spin"></div>
        <span className="absolute text-lg">🐝</span>
      </div>
      <p className="text-xs font-semibold text-stone-500 animate-pulse tracking-wide uppercase">
        Loading OneHive...
      </p>
    </div>
  );
};

export default PageLoader;
