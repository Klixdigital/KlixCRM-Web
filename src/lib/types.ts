// ==================== Contact ====================
export interface Contact {
  id: number; // Row index in sheet (row 2 = id 0)
  companyName: string;
  businessType: string;
  phoneNumber: string;
  status: string;
  remarks: string;
  lastCalledBy: string;
  lastCallDate: string;
  assignedTo: string;
}

// ==================== Call Status ====================
export type CallStatusKey =
  | "NEW"
  | "CALLING"
  | "HOT_LEAD"
  | "CALLBACK"
  | "NOT_INTERESTED"
  | "SIGNED";

export interface CallStatusInfo {
  key: CallStatusKey;
  label: string;
  sheetValue: string;
  color: string;
  bgColor: string;
}

export const CALL_STATUSES: Record<CallStatusKey, CallStatusInfo> = {
  NEW: {
    key: "NEW",
    label: "Nouveau",
    sheetValue: "Nouveau",
    color: "#94A3B8",
    bgColor: "rgba(148,163,184,0.15)",
  },
  CALLING: {
    key: "CALLING",
    label: "En cours d'appel",
    sheetValue: "En cours d'appel",
    color: "#FBBF24",
    bgColor: "rgba(251,191,36,0.15)",
  },
  HOT_LEAD: {
    key: "HOT_LEAD",
    label: "Hot Lead",
    sheetValue: "Hot Lead",
    color: "#22C55E",
    bgColor: "rgba(34,197,94,0.15)",
  },
  CALLBACK: {
    key: "CALLBACK",
    label: "À recontacter",
    sheetValue: "À recontacter",
    color: "#F97316",
    bgColor: "rgba(249,115,22,0.15)",
  },
  NOT_INTERESTED: {
    key: "NOT_INTERESTED",
    label: "Pas intéressé",
    sheetValue: "Pas intéressé",
    color: "#EF4444",
    bgColor: "rgba(239,68,68,0.15)",
  },
  SIGNED: {
    key: "SIGNED",
    label: "Client signé",
    sheetValue: "Client signé",
    color: "#3B82F6",
    bgColor: "rgba(59,130,246,0.15)",
  },
};

export function getCallStatusFromSheet(value?: string): CallStatusInfo {
  if (!value) return CALL_STATUSES.NEW;
  const found = Object.values(CALL_STATUSES).find(
    (s) => s.sheetValue.toLowerCase() === value.trim().toLowerCase()
  );
  return found || CALL_STATUSES.NEW;
}

export function getSelectableAfterCall(): CallStatusInfo[] {
  return [
    CALL_STATUSES.HOT_LEAD,
    CALL_STATUSES.CALLBACK,
    CALL_STATUSES.NOT_INTERESTED,
    CALL_STATUSES.SIGNED,
  ];
}

// ==================== Business Types ====================
export const BUSINESS_TYPES = [
  "Agences immobilières",
  "Plombiers",
  "Électriciens",
  "Restaurants / cafés",
  "Salons de coiffure / barber shops",
  "Boutiques de mode / prêt-à-porter",
  "Salles de sport / fitness",
  "Cabinets d'avocats",
  "Cabinets comptables / experts-comptables",
  "Magasins de décoration / mobilier",
  "Instituts de beauté / esthéticiennes",
  "Entreprises de nettoyage / services à domicile",
  "Concessionnaires automobiles / garages",
  "Centres médicaux / cliniques privées",
  "Écoles / centres de formation",
  "Hôtels / hébergements touristiques",
  "Agences de voyage / tour-opérateurs",
  "Imprimeries / services de communication visuelle",
  "Sociétés de transport / logistique",
  "Entreprises informatiques / services numériques",
] as const;

// ==================== AI Analysis ====================
export interface AiAnalysis {
  resume: string;
  statut_suggere: string;
  points_cles: string[];
  action_suivante: string;
}

export function formatAiAnalysisForSheet(analysis: AiAnalysis): string {
  let result = `\ud83d\udccb ${analysis.resume}`;
  if (analysis.points_cles.length > 0) {
    result += `\n\ud83d\udd11 Points cl\u00e9s :`;
    analysis.points_cles.forEach((point) => {
      result += `\n  \u2022 ${point}`;
    });
  }
  if (analysis.action_suivante) {
    result += `\n\u27a1\ufe0f Action : ${analysis.action_suivante}`;
  }
  return result;
}

// ==================== Pending Change (offline) ====================
export interface PendingChange {
  id?: number;
  contactId: number;
  column: string;
  newValue: string;
  timestamp: number;
}

// ==================== Auth ====================
export interface UserInfo {
  name: string;
  email: string;
  picture?: string;
  accessToken: string;
}
