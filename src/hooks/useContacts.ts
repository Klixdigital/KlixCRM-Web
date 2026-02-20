"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Contact } from "@/lib/types";
import { fetchContacts, updateContact, updateCell } from "@/lib/google-sheets";
import {
  getCachedContacts,
  cacheContacts,
  updateCachedContact,
  addPendingChange,
  getPendingChanges,
  removePendingChange,
} from "@/lib/offline-store";
import { POLLING_INTERVAL_MS } from "@/lib/constants";
import { useNetwork } from "./useNetwork";
import { getCurrentDateTimeForSheet } from "@/lib/date-utils";

interface UseContactsReturn {
  contacts: Contact[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  syncContacts: () => Promise<void>;
  prepareCall: (
    contactId: number,
    userName: string
  ) => Promise<Contact | null>;
  updateContactStatus: (
    contactId: number,
    status: string,
    remarks: string,
    userName: string
  ) => Promise<void>;
  clearError: () => void;
}

export function useContacts(accessToken: string | null): UseContactsReturn {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useNetwork();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const syncContacts = useCallback(async () => {
    if (!accessToken) return;

    try {
      if (isOnline) {
        // First sync any pending offline changes
        const pending = await getPendingChanges();
        for (const change of pending) {
          try {
            await updateCell(
              accessToken,
              change.contactId,
              change.column,
              change.newValue
            );
            if (change.id !== undefined) {
              await removePendingChange(change.id);
            }
          } catch (err) {
            console.error("Failed to sync pending change:", err);
          }
        }

        // Fetch fresh data
        const freshContacts = await fetchContacts(accessToken);
        setContacts(freshContacts);
        await cacheContacts(freshContacts);
        setError(null);
      } else {
        // Load from cache when offline
        const cached = await getCachedContacts();
        if (cached.length > 0) {
          setContacts(cached);
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur de synchronisation";
      if (message === "AUTH_EXPIRED") {
        setError("Session expir\u00e9e. Veuillez vous reconnecter.");
      } else {
        setError(message);
      }
      // Fall back to cache
      const cached = await getCachedContacts();
      if (cached.length > 0) {
        setContacts(cached);
      }
    }
  }, [accessToken, isOnline]);

  // Initial load
  useEffect(() => {
    if (!accessToken) return;

    const load = async () => {
      setIsLoading(true);
      await syncContacts();
      setIsLoading(false);
    };
    load();
  }, [accessToken, syncContacts]);

  // Polling
  useEffect(() => {
    if (!accessToken || !isOnline) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    pollingRef.current = setInterval(async () => {
      try {
        const freshContacts = await fetchContacts(accessToken);
        setContacts(freshContacts);
        await cacheContacts(freshContacts);
      } catch {
        // Silent fail for polling
      }
    }, POLLING_INTERVAL_MS);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [accessToken, isOnline]);

  const prepareCall = useCallback(
    async (contactId: number, userName: string): Promise<Contact | null> => {
      const contact = contacts.find((c) => c.id === contactId);
      if (!contact) return null;

      const updated: Contact = {
        ...contact,
        status: "En cours d'appel",
        lastCalledBy: userName,
        lastCallDate: getCurrentDateTimeForSheet(),
      };

      // Optimistic update
      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? updated : c))
      );
      await updateCachedContact(updated);

      if (isOnline && accessToken) {
        try {
          await updateContact(accessToken, updated);
        } catch {
          // Queue for later
          await addPendingChange({
            contactId,
            column: "D",
            newValue: "En cours d'appel",
            timestamp: Date.now(),
          });
        }
      } else {
        await addPendingChange({
          contactId,
          column: "D",
          newValue: "En cours d'appel",
          timestamp: Date.now(),
        });
      }

      return updated;
    },
    [contacts, accessToken, isOnline]
  );

  const updateContactStatus = useCallback(
    async (
      contactId: number,
      status: string,
      remarks: string,
      userName: string
    ) => {
      const contact = contacts.find((c) => c.id === contactId);
      if (!contact) return;

      const updated: Contact = {
        ...contact,
        status,
        remarks: remarks || contact.remarks,
        lastCalledBy: userName,
        lastCallDate: getCurrentDateTimeForSheet(),
      };

      // Optimistic update
      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? updated : c))
      );
      await updateCachedContact(updated);

      if (isOnline && accessToken) {
        try {
          await updateContact(accessToken, updated);
        } catch {
          // Queue for later
          await addPendingChange({
            contactId,
            column: "full",
            newValue: JSON.stringify(updated),
            timestamp: Date.now(),
          });
        }
      } else {
        await addPendingChange({
          contactId,
          column: "full",
          newValue: JSON.stringify(updated),
          timestamp: Date.now(),
        });
      }
    },
    [contacts, accessToken, isOnline]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await syncContacts();
    setIsRefreshing(false);
  }, [syncContacts]);

  const clearError = useCallback(() => setError(null), []);

  return {
    contacts,
    isLoading,
    isRefreshing,
    error,
    syncContacts: handleRefresh,
    prepareCall,
    updateContactStatus,
    clearError,
  };
}
