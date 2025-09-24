import React, { createContext, useState, useContext } from "react";
import type { AuthContextType } from "./AuthContexttypes";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const Login = async (email: string, password: string) => {
    // Try to login
    let res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const data = await res.json();
      setApiKey(data.api_key);
      setEmail(email);
      return true;
    }
    // If login fails, try to create the user (signup)
    // Prompt for name and phone_number (for demo, use window.prompt)
    const name = window.prompt("Enter your name to sign up:");
    const phone_number = window.prompt("Enter your phone number to sign up:");
    if (!name || !phone_number) return false;
    res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone_number, email, password })
    });
    if (res.ok) {
      // Try login again
      res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.api_key);
        setEmail(email);
        return true;
      }
    }
    return false;
  };

  const signOut = () => {
    setApiKey(null);
    setEmail(null);
  };

  return (
    <AuthContext.Provider value={{ apiKey, email, Login, signOut }}>
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
