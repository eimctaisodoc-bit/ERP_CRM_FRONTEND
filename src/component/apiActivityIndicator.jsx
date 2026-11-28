import React from 'react'
import { useEffect, useState } from "react";
import { getActiveApiRequestCount } from "../api/axios";


export const ApiActivityIndicator = () => {
  const [activeRequests, setActiveRequests] = useState(getActiveApiRequestCount);

  useEffect(() => {
    const updateActivity = (event) => {
      setActiveRequests(event.detail.activeRequests);
    };

    window.addEventListener("api-activity", updateActivity);
    setActiveRequests(getActiveApiRequestCount());
    return () => window.removeEventListener("api-activity", updateActivity);
  }, []);

  if (activeRequests === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Background requests in progress"
      className="fixed right-4 top-4 z-100 flex items-center gap-2 rounded-full border border-blue-100 bg-white/95 px-3 py-2 text-xs font-medium text-slate-700 shadow-lg backdrop-blur"
    >
      <span>Working...</span>
     
    </div>
  );
};
