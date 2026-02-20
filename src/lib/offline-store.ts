import { openDB, DBSchema, IDBPDatabase } from "idb";
import { Contact, PendingChange } from "./types";

interface KlixCrmDB extends DBSchema {
  contacts: {
    key: number;
    value: Contact;
    indexes: { "by-status": string };
  };
  pendingChanges: {
    key: number;
    value: PendingChange;
    indexes: { "by-timestamp": number };
  };
}

let dbPromise: Promise<IDBPDatabase<KlixCrmDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<KlixCrmDB>("klix-crm-db", 1, {
      upgrade(db) {
        const contactStore = db.createObjectStore("contacts", {
          keyPath: "id",
        });
        contactStore.createIndex("by-status", "status");

        const pendingStore = db.createObjectStore("pendingChanges", {
          keyPath: "id",
          autoIncrement: true,
        });
        pendingStore.createIndex("by-timestamp", "timestamp");
      },
    });
  }
  return dbPromise;
}

// ==================== Contacts ====================

export async function getCachedContacts(): Promise<Contact[]> {
  const db = await getDB();
  return db.getAll("contacts");
}

export async function cacheContacts(contacts: Contact[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("contacts", "readwrite");
  await tx.store.clear();
  for (const contact of contacts) {
    await tx.store.put(contact);
  }
  await tx.done;
}

export async function updateCachedContact(contact: Contact): Promise<void> {
  const db = await getDB();
  await db.put("contacts", contact);
}

// ==================== Pending Changes ====================

export async function addPendingChange(
  change: Omit<PendingChange, "id">
): Promise<void> {
  const db = await getDB();
  await db.add("pendingChanges", change as PendingChange);
}

export async function getPendingChanges(): Promise<PendingChange[]> {
  const db = await getDB();
  return db.getAllFromIndex("pendingChanges", "by-timestamp");
}

export async function clearPendingChanges(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("pendingChanges", "readwrite");
  await tx.store.clear();
  await tx.done;
}

export async function removePendingChange(id: number): Promise<void> {
  const db = await getDB();
  await db.delete("pendingChanges", id);
}
