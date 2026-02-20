"use client";

import React from "react";
import { Contact, getCallStatusFromSheet } from "@/lib/types";
import StatusBadge from "./StatusBadge";

interface ContactCardProps {
  contact: Contact;
  onClick: () => void;
  onCallClick: () => void;
}

export default function ContactCard({
  contact,
  onClick,
  onCallClick,
}: ContactCardProps) {
  const statusInfo = getCallStatusFromSheet(contact.status);
  const isCalling = statusInfo.key === "CALLING";

  return (
    <div
      className="bg-klix-card rounded-xl p-4 cursor-pointer active:scale-[0.98] transition-all duration-150 animate-slide-up"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Status dot */}
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isCalling ? "status-dot-calling" : ""}`}
              style={{ backgroundColor: statusInfo.color }}
            />
            <h3 className="text-white font-semibold text-sm truncate">
              {contact.companyName || "Sans nom"}
            </h3>
          </div>

          {contact.businessType && (
            <p className="text-klix-medium-gray text-xs mb-1.5 truncate pl-[18px]">
              {contact.businessType}
            </p>
          )}

          <div className="flex items-center gap-2 pl-[18px]">
            <StatusBadge status={contact.status} />
            {contact.phoneNumber && (
              <span className="text-klix-medium-gray text-xs truncate">
                {contact.phoneNumber}
              </span>
            )}
          </div>
        </div>

        {/* Right: Call button */}
        {contact.phoneNumber && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCallClick();
            }}
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isCalling
                ? "bg-status-calling/20 hover:bg-status-calling/30"
                : "bg-klix-orange/15 hover:bg-klix-orange/25"
            }`}
            aria-label="Appeler"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke={isCalling ? "#FBBF24" : "#FF5825"}
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
