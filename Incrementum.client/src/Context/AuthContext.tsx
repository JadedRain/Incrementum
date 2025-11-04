import React, { createContext, useState, useContext, useMemo, useCallback } from "react";
import type { AuthContextType } from "./AuthContext.types";
import { signInApi, signUpApi } from "./authApi";
import { getAuthFromStorage, setAuthToStorage } from "./authStorage";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const KEYCLOAK_REALM_URL = 'https://auth-dev.snowse.io/realms/DevRealm';
const CLIENT_ID = 'incrementum-client';

const keycloakLogin = async (username: string, password: string) => {
  try {
    const res = await fetch(`${KEYCLOAK_REALM_URL}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'password', client_id: CLIENT_ID, username, password }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.access_token;
    }
    console.error('Keycloak login failed:', res.status, await res.text());
  } catch (e) {
    console.error('Keycloak login error:', e);
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ apiKey: string | null; email: string | null }>(() => {
    const stored = getAuthFromStorage();
    return stored.apiKey && stored.email ? stored : { apiKey: null, email: null };
  });

  const setUserAndPersist = (apiKey: string | null, email: string | null) => {
    setUser({ apiKey, email });
    setAuthToStorage(apiKey, email);
  };

  const signIn = useCallback(async (email: string, password: string) => {
    const keycloakToken = await keycloakLogin(email, password);
    if (keycloakToken) {
      // Sync Keycloak user to database
      try {
        const syncResponse = await fetch('/api/sync-keycloak-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: keycloakToken }),
        });
        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          // Use database API key for consistency with rest of app
          setUserAndPersist(syncData.api_key, email);
          return true;
        }
      } catch (e) {
        console.error('Failed to sync Keycloak user:', e);
      }
      // Fallback: use Keycloak token directly if sync fails
      setUserAndPersist(keycloakToken, email);
      return true;
    }
    const result = await signInApi(email, password);
    if (result) {
      setUserAndPersist(result.apiKey, result.email);
      return true;
    }
    return false;
  }, []);

  const signUp = useCallback(async (name: string, phoneNumber: string, email: string, password: string) => {
    // Legacy signup only - Keycloak users register directly in Keycloak
    const result = await signUpApi(name, phoneNumber, email, password);
    if (result) {
      setUserAndPersist(result.apiKey, result.email);
      return true;
    }
    return false;
  }, []);

  const signOut = useCallback(() => {
    setUserAndPersist(null, null);
  }, []);

  const contextValue = useMemo(() => ({
    apiKey: user.apiKey,
    email: user.email,
    signIn,
    signUp,
    signOut,
  }), [user.apiKey, user.email, signIn, signUp, signOut]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
