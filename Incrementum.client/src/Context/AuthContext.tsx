import React, { createContext, useState, useContext, useMemo, useCallback } from "react";
import type { AuthContextType } from "./AuthContext.types";
import { signInApi, signUpApi } from "./authApi";
import { getAuthFromStorage, setAuthToStorage } from "./authStorage";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ apiKey: string | null; email: string | null }>(getAuthFromStorage());

  const setUserAndPersist = (apiKey: string | null, email: string | null) => {
    setUser({ apiKey, email });
    setAuthToStorage(apiKey, email);
  };

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await signInApi(email, password);
    if (result) {
      setUserAndPersist(result.apiKey, result.email);
      return true;
    }
    return false;
  }, []);

  const signUp = useCallback(async (name: string, phoneNumber: string, email: string, password: string) => {
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

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
