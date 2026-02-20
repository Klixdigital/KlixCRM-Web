"use client";

import React from "react";

interface KlixTopBarProps {
  onBack?: () => void;
  title?: string;
  rightAction?: React.ReactNode;
}

export default function KlixTopBar({
  onBack,
  title,
  rightAction,
}: KlixTopBarProps) {
  return (
    <header className="sticky top-0 z-50 bg-klix-dark-blue border-b border-klix-divider safe-top">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-lg hover:bg-klix-card transition-colors"
              aria-label="Retour"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          {title ? (
            <h1 className="text-lg font-semibold text-white truncate">
              {title}
            </h1>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-klix-orange flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-white font-semibold text-lg">
                KLIX CRM
              </span>
            </div>
          )}
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  );
}
