"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useContacts } from "@/hooks/useContacts";
import { useNetwork } from "@/hooks/useNetwork";
import { Contact, getCallStatusFromSheet } from "@/lib/types";
import KlixTopBar from "@/components/KlixTopBar";
import OfflineBanner from "@/components/OfflineBanner";
import LoadingSpinner from "@/components/LoadingSpinner";
import ContactCard from "@/components/ContactCard";
import FilterChips from "@/components/FilterChips";

export default function ContactListPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const isOnline = useNetwork();
  const {
    contacts,
    isLoading,
    isRefreshing,
    error,
    syncContacts,
    prepareCall,
    clearError,
  } = useContacts(user?.accessToken ?? null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<string[]>(
    []
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user, router]);

  // Filter contacts
  const filteredContacts = useMemo(() => {
    let result = contacts;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          c.phoneNumber.includes(q) ||
          c.businessType.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (selectedStatuses.length > 0) {
      result = result.filter((c) => selectedStatuses.includes(c.status));
    }

    // Business type filter
    if (selectedBusinessTypes.length > 0) {
      result = result.filter((c) =>
        selectedBusinessTypes.includes(c.businessType)
      );
    }

    return result;
  }, [contacts, searchQuery, selectedStatuses, selectedBusinessTypes]);

  const handleContactClick = useCallback(
    (contact: Contact) => {
      router.push(`/contacts/${contact.id}`);
    },
    [router]
  );

  const handleCallClick = useCallback(
    async (contact: Contact) => {
      if (!user) return;

      const statusInfo = getCallStatusFromSheet(contact.status);

      // If already calling, go to post-call screen
      if (statusInfo.key === "CALLING") {
        router.push(`/contacts/${contact.id}/post-call`);
        return;
      }

      // Mark as calling
      await prepareCall(contact.id, user.name);

      // Open phone dialer (works on mobile)
      if (contact.phoneNumber) {
        window.location.href = `tel:${contact.phoneNumber}`;
      }
    },
    [user, prepareCall, router]
  );

  const toggleStatus = useCallback((status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  }, []);

  const toggleBusinessType = useCallback((type: string) => {
    setSelectedBusinessTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedStatuses([]);
    setSelectedBusinessTypes([]);
    setSearchQuery("");
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-klix-dark-blue">
      <KlixTopBar
        rightAction={
          <button
            onClick={() => {
              signOut();
              router.replace("/");
            }}
            className="p-2 rounded-lg hover:bg-klix-card transition-colors"
            aria-label="D\u00e9connexion"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        }
      />

      <OfflineBanner isOffline={!isOnline} />

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-2 bg-red-900/20 border border-red-700/30 rounded-lg px-3 py-2 flex items-center gap-2 animate-fade-in">
          <svg
            className="w-4 h-4 text-red-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p className="text-red-400 text-xs flex-1">{error}</p>
          <button onClick={clearError} className="text-red-400 p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Search bar */}
      <div className="px-4 pt-3 pb-1">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-klix-medium-gray"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un contact\u2026"
            className="w-full bg-klix-card border border-klix-divider rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-klix-medium-gray focus:border-klix-orange transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-klix-medium-gray hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <FilterChips
        selectedStatuses={selectedStatuses}
        selectedBusinessTypes={selectedBusinessTypes}
        onStatusToggle={toggleStatus}
        onBusinessTypeToggle={toggleBusinessType}
        onClearAll={clearFilters}
      />

      {/* Contact count */}
      <div className="px-4 pb-2">
        <span className="text-klix-medium-gray text-xs">
          {filteredContacts.length} contact(s)
          {isRefreshing && " \u2014 Synchronisation\u2026"}
        </span>
      </div>

      {/* Contact list */}
      {isLoading && contacts.length === 0 ? (
        <LoadingSpinner message="Chargement des contacts\u2026" />
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-2">
          {/* Pull to refresh indicator */}
          {isRefreshing && (
            <div className="flex justify-center py-2">
              <div className="w-6 h-6 border-2 border-klix-orange border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {filteredContacts.length === 0 ? (
            <div className="text-center py-16">
              <svg
                className="w-12 h-12 text-klix-medium-gray mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-klix-medium-gray text-sm">
                Aucun contact trouv\u00e9
              </p>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onClick={() => handleContactClick(contact)}
                onCallClick={() => handleCallClick(contact)}
              />
            ))
          )}

          {/* Manual refresh button at bottom */}
          <button
            onClick={syncContacts}
            disabled={isRefreshing}
            className="w-full py-3 text-klix-medium-gray text-xs hover:text-white transition-colors disabled:opacity-50"
          >
            {isRefreshing ? "Synchronisation\u2026" : "\u2191 Tirer pour rafra\u00eechir"}
          </button>
        </div>
      )}
    </div>
  );
}
