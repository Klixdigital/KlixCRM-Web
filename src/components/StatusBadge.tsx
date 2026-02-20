"use client";

import React from "react";
import { getCallStatusFromSheet, CallStatusInfo } from "@/lib/types";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const statusInfo: CallStatusInfo = getCallStatusFromSheet(status);
  const isCalling = statusInfo.key === "CALLING";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
      style={{
        backgroundColor: statusInfo.bgColor,
        color: statusInfo.color,
      }}
    >
      <span
        className={`w-2 h-2 rounded-full ${isCalling ? "status-dot-calling" : ""}`}
        style={{ backgroundColor: statusInfo.color }}
      />
      {statusInfo.label}
    </span>
  );
}
