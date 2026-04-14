"use client";

import { useState, useEffect } from "react";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const goOffline = () => {
      setShowReconnected(false);
      setIsOffline(true);
      setVisible(true);
    };

    const goOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => {
        setVisible(false);
        setTimeout(() => setShowReconnected(false), 300);
      }, 3000);
    };

    if (!navigator.onLine) {
      goOffline();
    }

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      } ${isOffline ? "bg-red-600" : "bg-success"}`}
    >
      {isOffline ? (
        <>
          <svg
            className="h-4 w-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
          <span>Sem conexão — modo offline</span>
          <span className="relative ml-1 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-300 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-200" />
          </span>
        </>
      ) : (
        <span>Conexão restaurada</span>
      )}
    </div>
  );
}
