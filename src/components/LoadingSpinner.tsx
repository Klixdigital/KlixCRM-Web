"use client";

import React from "react";

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({
  message = "Chargement\u2026",
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-3 border-klix-orange border-t-transparent rounded-full animate-spin" />
      <p className="text-klix-medium-gray text-sm">{message}</p>
    </div>
  );
}
