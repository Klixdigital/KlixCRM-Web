"use client";

import React, { useState } from "react";
import { CALL_STATUSES, CallStatusInfo, BUSINESS_TYPES } from "@/lib/types";

interface FilterChipsProps {
  selectedStatuses: string[];
  selectedBusinessTypes: string[];
  onStatusToggle: (status: string) => void;
  onBusinessTypeToggle: (type: string) => void;
  onClearAll: () => void;
}

export default function FilterChips({
  selectedStatuses,
  selectedBusinessTypes,
  onStatusToggle,
  onBusinessTypeToggle,
  onClearAll,
}: FilterChipsProps) {
  const [showBusinessTypes, setShowBusinessTypes] = useState(false);
  const [btSearch, setBtSearch] = useState("");

  const allStatuses = Object.values(CALL_STATUSES);
  const hasFilters = selectedStatuses.length > 0 || selectedBusinessTypes.length > 0;

  const filteredBT = BUSINESS_TYPES.filter((t) =>
    t.toLowerCase().includes(btSearch.toLowerCase())
  );

  return (
    <div className="px-4 py-2">
      {/* Status chips row */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
        {allStatuses.map((status: CallStatusInfo) => {
          const isSelected = selectedStatuses.includes(status.sheetValue);
          return (
            <button
              key={status.key}
              onClick={() => onStatusToggle(status.sheetValue)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                isSelected
                  ? "ring-1 ring-white/30"
                  : "opacity-60 hover:opacity-80"
              }`}
              style={{
                backgroundColor: isSelected
                  ? status.bgColor
                  : "rgba(255,255,255,0.05)",
                color: isSelected ? status.color : "#94A3B8",
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: isSelected ? status.color : "#64748B",
                }}
              />
              {status.label}
            </button>
          );
        })}
      </div>

      {/* Business type filter + clear */}
      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={() => setShowBusinessTypes(!showBusinessTypes)}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
            selectedBusinessTypes.length > 0
              ? "bg-klix-orange/15 text-klix-orange ring-1 ring-klix-orange/30"
              : "bg-white/5 text-klix-medium-gray hover:bg-white/10"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Type{selectedBusinessTypes.length > 0 ? ` (${selectedBusinessTypes.length})` : ""}
          <svg className={`w-3 h-3 transition-transform ${showBusinessTypes ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {hasFilters && (
          <button
            onClick={onClearAll}
            className="text-xs text-klix-medium-gray hover:text-white transition-colors"
          >
            Effacer filtres
          </button>
        )}
      </div>

      {/* Business type modal/dropdown */}
      {showBusinessTypes && (
        <div className="mt-2 bg-klix-card rounded-xl border border-klix-divider p-3 animate-slide-up max-h-64 overflow-hidden flex flex-col">
          <input
            type="text"
            value={btSearch}
            onChange={(e) => setBtSearch(e.target.value)}
            placeholder="Rechercher un type..."
            className="w-full bg-klix-dark-blue border border-klix-divider rounded-lg px-3 py-2 text-sm text-white placeholder:text-klix-medium-gray mb-2"
          />
          <div className="overflow-y-auto flex-1 space-y-1">
            {filteredBT.map((bt) => {
              const isSelected = selectedBusinessTypes.includes(bt);
              return (
                <button
                  key={bt}
                  onClick={() => onBusinessTypeToggle(bt)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                    isSelected
                      ? "bg-klix-orange/15 text-klix-orange"
                      : "text-klix-medium-gray hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                        isSelected
                          ? "bg-klix-orange border-klix-orange"
                          : "border-klix-divider"
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    {bt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
