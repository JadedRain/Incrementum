import React, { createContext, useState, useContext, useMemo, useCallback } from "react";
import type { AuthContextType } from "./AuthContext.types";
import { signInApi, signUpApi } from "./authApi";
import { getAuthFromStorage, setAuthToStorage } from "./authStorage";
import { apiString, fetchWrapper } from "./FetchingHelper";
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AccountNotExistError = 'account-not-found';
// Keycloak configuration
export const KEYCLOAK_REALM_URL = 'https://auth-dev.snowse.io/realms/incrementum';
export const KEYCLOAK_CLIENT_ID = 'incrementum-client';

// eslint-disable-next-line react-refresh/only-export-components
export const getKeycloakRegistrationUrl = () => {
  return `${KEYCLOAK_REALM_URL}/protocol/openid-connect/registrations?client_id=${KEYCLOAK_CLIENT_ID}&response_type=code&scope=openid&redirect_uri=${window.location.origin}/`;
};

const keycloakLogin = async (username: string, password: string) => {
  try {
    const res = await fetch(apiString('/api/keycloak-login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const errData = await res.json();
      if (errData.error_description?.includes('Account not found')) {
        return { token: null, errorType: AccountNotExistError };
      }
      return { token: null, errorType: 'auth-failure' };
    }
    const data = await res.json();
    return { token: data.access_token, errorType: null };
  } catch (e) {
    console.error("Network Error", e)
    return { token: null, errorType: 'network-error' };
  }
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
    const { token, errorType } = await keycloakLogin(email, password);
    
    if (token && errorType != AccountNotExistError) {
      try {
        const syncResponse = await fetchWrapper(()=>fetch(apiString('/api/sync-keycloak-user'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        }));
        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          setUserAndPersist(syncData.api_key, email);
          return true;
        } else {
          console.error('Failed to sync Keycloak user - sync endpoint returned error');
          return false;
        }
      } catch (e) {
        console.error('Failed to sync Keycloak user:', e);
        return false;
      }
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
