// ==================== Google OAuth2 ====================
export const GOOGLE_WEB_CLIENT_ID =
  "73160880275-iea83onvq2froidlppb4164vded1u0hn.apps.googleusercontent.com";
export const GOOGLE_SCOPES = "https://www.googleapis.com/auth/spreadsheets";

// ==================== Google Sheets ====================
export const GOOGLE_SHEETS_BASE_URL = "https://sheets.googleapis.com/v4";
export const SPREADSHEET_ID = "1vtuMsBcxIckRI-zVH9JizLTCOriGSRMPH64OfEVSxDQ";
export const SHEET_NAME = "Feuille 1";
export const SHEET_RANGE_READ = "'Feuille 1'!A2:H";

// ==================== Anthropic (Claude AI) ====================
// API key is kept server-side only (in API routes) for security
export const ANTHROPIC_MODEL = "claude-3-5-sonnet-20240620";
export const AI_SYSTEM_PROMPT = `Tu es un assistant commercial pour KLIX Digital.
On te donne la transcription d'un message vocal après un appel.
Extraire les infos et suggérer un statut parmi: Hot Lead, À recontacter, Pas intéressé, Client signé.

Réponds UNIQUEMENT avec un JSON :
{
  "resume": "Résumé de l'appel",
  "statut_suggere": "Statut",
  "points_cles": ["point 1"],
  "action_suivante": "Action"
}`;

// ==================== Configuration ====================
export const POLLING_INTERVAL_MS = 10_000;
export const MAX_RECORDING_DURATION_MS = 120_000;
export const DATE_FORMAT = "dd/MM/yyyy HH:mm";
