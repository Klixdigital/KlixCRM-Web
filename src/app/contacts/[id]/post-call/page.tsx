"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useContacts } from "@/hooks/useContacts";
import { Contact, getSelectableAfterCall, CallStatusInfo } from "@/lib/types";
import KlixTopBar from "@/components/KlixTopBar";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function PostCallPage() {
  const router = useRouter();
  const params = useParams();
  const contactId = Number(params.id);
  const { user } = useAuth();
  const { contacts, updateContactStatus } = useContacts(
    user?.accessToken ?? null
  );

  const [contact, setContact] = useState<Contact | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<CallStatusInfo | null>(
    null
  );
  const [remarks, setRemarks] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectableStatuses = getSelectableAfterCall();

  useEffect(() => {
    if (!user) {
      router.replace("/");
      return;
    }
    const found = contacts.find((c) => c.id === contactId);
    if (found) {
      setContact(found);
      setRemarks(found.remarks || "");
    }
  }, [user, contacts, contactId, router]);

  const handleSave = useCallback(async () => {
    if (!selectedStatus || !contact || !user) return;

    setIsSaving(true);
    try {
      await updateContactStatus(
        contact.id,
        selectedStatus.sheetValue,
        remarks,
        user.name
      );
      // Navigate back to contact detail
      router.push(`/contacts/${contact.id}`);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setIsSaving(false);
    }
  }, [selectedStatus, contact, user, remarks, updateContactStatus, router]);

  if (!user) return null;

  if (!contact) {
    return (
      <div className="min-h-screen flex flex-col bg-klix-dark-blue">
        <KlixTopBar onBack={() => router.back()} />
        <LoadingSpinner message="Chargement…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-klix-dark-blue">
      <KlixTopBar onBack={() => router.back()} />

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {/* Header */}
        <div className="mt-4 mb-6">
          <h1 className="text-lg font-bold text-klix-orange mb-1">
            Résumé de l&apos;appel
          </h1>
          <p className="text-white text-base font-medium">
            {contact.companyName}
          </p>
        </div>

        {/* Status selection */}
        <div className="mb-6">
          <h2 className="text-white text-sm font-semibold mb-3">
            Choisir le statut
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {selectableStatuses.map((status) => {
              const isSelected = selectedStatus?.key === status.key;
              return (
                <button
                  key={status.key}
                  onClick={() => setSelectedStatus(status)}
                  className={`relative rounded-xl border-2 px-4 py-3.5 text-left transition-all active:scale-[0.97] ${
                    isSelected
                      ? "bg-opacity-20"
                      : "bg-klix-card border-klix-divider"
                  }`}
                  style={{
                    borderColor: isSelected ? status.color : undefined,
                    backgroundColor: isSelected ? status.bgColor : undefined,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0`}
                      style={{ backgroundColor: status.color }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: isSelected ? status.color : "#E2E8F0" }}
                    >
                      {status.label}
                    </span>
                  </div>
                  {isSelected && (
                    <div
                      className="absolute top-2 right-2"
                      style={{ color: status.color }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-8">
          <h2 className="text-white text-sm font-semibold mb-2">
            Résumé / Notes
          </h2>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Copiez-collez votre résumé ici…"
            rows={6}
            className="w-full bg-klix-card border border-klix-divider rounded-xl px-4 py-3 text-sm text-white placeholder:text-klix-medium-gray focus:border-klix-orange transition-colors resize-none"
            style={{ fontSize: "16px" }}
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!selectedStatus || isSaving}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] ${
            selectedStatus && !isSaving
              ? "bg-klix-orange text-white hover:bg-klix-orange/90"
              : "bg-klix-card text-klix-medium-gray cursor-not-allowed"
          }`}
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enregistrement…
            </span>
          ) : (
            "Enregistrer"
          )}
        </button>
      </div>
    </div>
  );
}
