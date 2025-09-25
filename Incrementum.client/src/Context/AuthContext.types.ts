export type AuthContextType = {
  apiKey: string | null;
  email: string | null;
  Login: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
};
