import { useMemo, type ReactNode, createElement } from "react";
import ThemeToggle from "../Components/ThemeToggle";

type Account = { 
  name: string; 
  email: string; 
  phone_number: string;
  is_keycloak_user: boolean;
} | null;

type Row = { label: string; value: ReactNode };
type Section = { title?: string; rows: Row[] };

export default function useSettingsContent(active: "account" | "notification" | "customize", account: Account) {
  return useMemo(() => {
    if (active === "account") {
      const isKeycloakUser = account?.is_keycloak_user ?? false;
      
      const accountRows: Row[] = [
        { label: "Name", value: account?.name ?? "—" },
        { label: "Email", value: account?.email ?? "—" },
      ];
      
      // Only show phone number if not a Keycloak user
      if (!isKeycloakUser) {
        accountRows.push({ label: "Phone Number", value: account?.phone_number ?? "—" });
      }
      
      const sections: Section[] = [
        {
          title: "Account Info",
          rows: accountRows,
        },
      ];
      return { title: "Account Settings", sections };
    }

    return {
      title: "Customize",
      sections: [
        { title: undefined, rows: [ { label: "Theme", value: createElement(ThemeToggle) } ] },
      ],
    };
  }, [active, account]);
}