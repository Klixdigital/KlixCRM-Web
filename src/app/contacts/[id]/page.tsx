"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useContacts } from "@/hooks/useContacts";
import { useNetwork } from "@/hooks/useNetwork";
import { Contact, getCallStatusFromSheet } from "@/lib/types";
import KlixTopBar from "@/components/KlixTopBar";
import StatusBadge from "@/components/StatusBadge";
import OfflineBanner from "@/components/OfflineBanner";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contactId = Number(params.id);
  const { user } = useAuth();
  const isOnline = useNetwork();
  const { contacts, isLoading, prepareCall } = useContacts(
    user?.accessToken ?? null
  );

  const [contact, setContact] = useState<Contact | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/");
      return;
    }
    const found = contacts.find((c) => c.id === contactId);
    if (found) setContact(found);
  }, [user, contacts, contactId, router]);

  const handleCall = useCallback(async () => {
    if (!contact || !user) return;

    const statusInfo = getCallStatusFromSheet(contact.status);

    // If already calling, go to post-call screen
    if (statusInfo.key === "CALLING") {
      router.push(`/contacts/${contact.id}/post-call`);
      return;
    }

    // Mark as calling
    await prepareCall(contact.id, user.name);

    // Open phone dialer
    if (contact.phoneNumber) {
      window.location.href = `tel:${contact.phoneNumber}`;
    }
  }, [contact, user, prepareCall, router]);

  if (!user) return null;

  if (isLoading && !contact) {
    return (
      <div className="min-h-screen flex flex-col bg-klix-dark-blue">
        <KlixTopBar
          onBack={() => router.back()}
        />
        <LoadingSpinner message="Chargement…" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen flex flex-col bg-klix-dark-blue">
        <KlixTopBar
          onBack={() => router.back()}
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-klix-medium-gray text-sm">Contact introuvable</p>
        </div>
      </div>
    );
  }

  const statusInfo = getCallStatusFromSheet(contact.status);
  const isCalling = statusInfo.key === "CALLING";

  return (
    <div className="min-h-screen flex flex-col bg-klix-dark-blue">
      <KlixTopBar
        onBack={() => router.back()}
      />

      <OfflineBanner isOffline={!isOnline} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {/* Company name & type */}
        <div className="mt-4 mb-3">
          <h1 className="text-xl font-bold text-white mb-1">
            {contact.companyName}
          </h1>
          <p className="text-klix-medium-gray text-sm">
            {contact.businessType}
          </p>
        </div>

        {/* Status */}
        <div className="mb-4">
          <StatusBadge status={contact.status} size="md" />
        </div>

        {/* Phone number card */}
        <div className="bg-klix-card rounded-xl border border-klix-divider p-4 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-klix-orange/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-klix-orange"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-klix-medium-gray text-xs mb-0.5">Téléphone</p>
                <a
                  href={`tel:${contact.phoneNumber}`}
                  className="text-white text-sm font-medium"
                >
                  {contact.phoneNumber || "—"}
                </a>
              </div>
            </div>
            {contact.phoneNumber && (
              <a
                href={`tel:${contact.phoneNumber}`}
                className="w-10 h-10 rounded-full bg-klix-orange/10 flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 text-klix-orange"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Call info card */}
        <div className="bg-klix-card rounded-xl border border-klix-divider p-4 mb-3">
          <h2 className="text-white text-sm font-semibold mb-3">
            Informations d&apos;appel
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-klix-dark-blue flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-klix-medium-gray"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-klix-medium-gray text-xs">Dernier appel par</p>
                <p className="text-white text-sm">
                  {contact.lastCalledBy || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-klix-dark-blue flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-klix-medium-gray"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-klix-medium-gray text-xs">Date du dernier appel</p>
                <p className="text-white text-sm">
                  {contact.lastCallDate || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-klix-dark-blue flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-klix-medium-gray"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-klix-medium-gray text-xs">Assigné à</p>
                <p className="text-white text-sm">
                  {contact.assignedTo || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Remarks card */}
        <div className="bg-klix-card rounded-xl border border-klix-divider p-4 mb-3">
          <h2 className="text-white text-sm font-semibold mb-2">
            Remarques
          </h2>
          <p className="text-klix-light-gray text-sm whitespace-pre-wrap">
            {contact.remarks || "Aucune remarque"}
          </p>
        </div>
      </div>

      {/* Floating call button */}
      <div className="fixed bottom-6 right-6 max-w-lg" style={{ right: "calc(50% - min(50%, 256px) + 24px)" }}>
        <button
          onClick={handleCall}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 ${
            isCalling
              ? "bg-yellow-500 animate-pulse"
              : "bg-klix-orange hover:bg-klix-orange/90"
          }`}
          aria-label={isCalling ? "Terminer l'appel" : "Appeler"}
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
