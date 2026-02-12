export type AuthContextType = {
  apiKey: string | null;
  email: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, phoneNumber: string, email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  signOut: () => void | Promise<void>;
};
