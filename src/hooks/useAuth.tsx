"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { UserInfo } from "@/lib/types";
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_SCOPES } from "@/lib/constants";

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  error: string | null;
  signIn: () => void;
  signOut: () => void;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  signIn: () => {},
  signOut: () => {},
  refreshToken: async () => null,
});

export function useAuth() {
  return useContext(AuthContext);
}

// Helper: detect mobile
function isMobileDevice() {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Declare Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          prompt: () => void;
          revoke: (email: string, callback: () => void) => void;
        };
        oauth2: {
          initTokenClient: (config: Record<string, unknown>) => {
            requestAccessToken: (overrides?: Record<string, unknown>) => void;
          };
        };
      };
    };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gsiLoaded, setGsiLoaded] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tokenClientRef = useRef<any>(null);

  // Load Google Identity Services script
  useEffect(() => {
    if (window.google?.accounts) {
      setGsiLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGsiLoaded(true);
    script.onerror = () => setError("Impossible de charger Google Sign-In");
    document.head.appendChild(script);
  }, []);

  // Initialize once GSI is loaded
  useEffect(() => {
    if (!gsiLoaded || !window.google) return;

    // Check for saved session
    const savedUser = sessionStorage.getItem("klix-user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch {
        sessionStorage.removeItem("klix-user");
      }
    }
    setIsLoading(false);
  }, [gsiLoaded]);

  // Handle OAuth callback (for mobile redirect flow)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get("access_token");
    
    if (accessToken) {
      // Get user info from Google
      fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
        .then(res => res.json())
        .then(data => {
          const userInfo: UserInfo = {
            name: data.name || data.email,
            email: data.email,
            picture: data.picture,
            accessToken: accessToken,
          };
          setUser(userInfo);
          sessionStorage.setItem("klix-user", JSON.stringify(userInfo));
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch(err => {
          console.error("Failed to get user info:", err);
          setError("Échec de la connexion");
        });
    }
  }, []);

  const signIn = useCallback(() => {
    if (!window.google && !isMobileDevice()) {
      setError("Google Sign-In non disponible");
      return;
    }

    setError(null);

    // MOBILE: Use redirect flow
    if (isMobileDevice()) {
      const redirectUri = window.location.origin + window.location.pathname;
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
        client_id: GOOGLE_WEB_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: "token",
        scope: GOOGLE_SCOPES + " https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
        include_granted_scopes: "true",
        state: "pass-through-value"
      }).toString();

      window.location.href = authUrl;
      return;
    }

    // DESKTOP: Use GSI popup flow
    window.google!.accounts.id.initialize({
      client_id: GOOGLE_WEB_CLIENT_ID,
      callback: (response: { credential?: string }) => {
        if (!response.credential) {
          setError("Connexion annulée");
          return;
        }

        const payload = JSON.parse(atob(response.credential.split(".")[1]));
        const userInfo: Partial<UserInfo> = {
          name: payload.name || payload.email,
          email: payload.email,
          picture: payload.picture,
        };

        const tokenClient = window.google!.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_WEB_CLIENT_ID,
          scope: GOOGLE_SCOPES,
          callback: (tokenResponse: { access_token?: string; error?: string }) => {
            if (tokenResponse.error || !tokenResponse.access_token) {
              setError("Impossible d'obtenir l'accès à Google Sheets");
              return;
            }

            const fullUser: UserInfo = {
              name: userInfo.name!,
              email: userInfo.email!,
              picture: userInfo.picture,
              accessToken: tokenResponse.access_token,
            };

            setUser(fullUser);
            sessionStorage.setItem("klix-user", JSON.stringify(fullUser));
          },
        });

        tokenClientRef.current = tokenClient;
        tokenClient.requestAccessToken({ prompt: "consent" });
      },
      auto_select: false,
    });

    window.google!.accounts.id.prompt();
  }, []);

  const signOut = useCallback(() => {
    if (user && window.google) {
      window.google.accounts.id.revoke(user.email, () => {});
    }
    setUser(null);
    sessionStorage.removeItem("klix-user");
  }, [user]);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!window.google) {
        resolve(null);
        return;
      }

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_WEB_CLIENT_ID,
        scope: GOOGLE_SCOPES,
        callback: (tokenResponse: { access_token?: string; error?: string }) => {
          if (tokenResponse.error || !tokenResponse.access_token) {
            resolve(null);
            return;
          }

          if (user) {
            const updated = { ...user, accessToken: tokenResponse.access_token };
            setUser(updated);
            sessionStorage.setItem("klix-user", JSON.stringify(updated));
          }
          resolve(tokenResponse.access_token);
        },
      });

      tokenClient.requestAccessToken({ prompt: "" });
    });
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, error, signIn, signOut, refreshToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}