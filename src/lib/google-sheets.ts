import {
  GOOGLE_SHEETS_BASE_URL,
  SPREADSHEET_ID,
  SHEET_NAME,
  SHEET_RANGE_READ,
} from "./constants";
import { Contact } from "./types";

/**
 * Fetches all contacts from Google Sheets.
 * Uses the user's OAuth access token for authorization.
 */
export async function fetchContacts(accessToken: string): Promise<Contact[]> {
  const url = `${GOOGLE_SHEETS_BASE_URL}/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_RANGE_READ)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    throw new Error("AUTH_EXPIRED");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Erreur Google Sheets: ${response.status} - ${errorData?.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  const rows: string[][] = data.values || [];

  return rows.map((row, index) => ({
    id: index,
    companyName: row[0] || "",
    businessType: row[1] || "",
    phoneNumber: row[2] || "",
    status: row[3] || "Nouveau",
    remarks: row[4] || "",
    lastCalledBy: row[5] || "",
    lastCallDate: row[6] || "",
    assignedTo: row[7] || "",
  }));
}

/**
 * Updates a specific contact row in Google Sheets.
 * The row number is contactId + 2 (row 1 = headers, row 2 = first data row = id 0).
 */
export async function updateContact(
  accessToken: string,
  contact: Contact
): Promise<void> {
  const rowNumber = contact.id + 2;
  const range = `'${SHEET_NAME}'!A${rowNumber}:H${rowNumber}`;
  const url = `${GOOGLE_SHEETS_BASE_URL}/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;

  const body = {
    range,
    majorDimension: "ROWS",
    values: [
      [
        contact.companyName,
        contact.businessType,
        contact.phoneNumber,
        contact.status,
        contact.remarks,
        contact.lastCalledBy,
        contact.lastCallDate,
        contact.assignedTo,
      ],
    ],
  };

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    throw new Error("AUTH_EXPIRED");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Erreur mise à jour: ${response.status} - ${errorData?.error?.message || response.statusText}`
    );
  }
}

/**
 * Updates a specific cell in Google Sheets.
 * columnLetter: A-H, rowNumber = contactId + 2
 */
export async function updateCell(
  accessToken: string,
  contactId: number,
  columnLetter: string,
  value: string
): Promise<void> {
  const rowNumber = contactId + 2;
  const range = `'${SHEET_NAME}'!${columnLetter}${rowNumber}`;
  const url = `${GOOGLE_SHEETS_BASE_URL}/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;

  const body = {
    range,
    majorDimension: "ROWS",
    values: [[value]],
  };

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    throw new Error("AUTH_EXPIRED");
  }

  if (!response.ok) {
    throw new Error(`Erreur mise à jour cellule: ${response.status}`);
  }
}
