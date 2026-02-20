"use client";

import React from "react";

interface OfflineBannerProps {
  isOffline: boolean;
}

export default function OfflineBanner({ isOffline }: OfflineBannerProps) {
  if (!isOffline) return null;

  return (
    <div className="bg-yellow-900/30 border-b border-yellow-700/40 px-4 py-2 flex items-center gap-2 animate-fade-in">
      <svg
        className="w-4 h-4 text-yellow-400 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 5.636a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.536 8.464a5 5 0 010 7.072M8.464 15.536a5 5 0 010-7.072"
        />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </svg>
      <span className="text-yellow-300 text-xs font-medium">
        Mode hors ligne — Les modifications seront synchronis\u00e9es
      </span>
    </div>
  );
}
