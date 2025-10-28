import { useMemo } from "react";

type Account = { name: string; email: string; phone_number: string } | null;

type Row = { label: string; value: any };
type Section = { title?: string; rows: Row[] };

export default function useSettingsContent(active: "account" | "notification" | "customize", account: Account) {
  return useMemo(() => {
    if (active === "account") {
      const sections: Section[] = [
        {
          title: "Account Info",
          rows: [
            { label: "Name", value: account?.name ?? "—" },
            { label: "Email", value: account?.email ?? "—" },
            { label: "Phone Number", value: account?.phone_number ?? "—" },
          ],
        },
      ];
      return { title: "Account Settings", sections };
    }

    if (active === "notification") {
      return {
        title: "Notification Settings",
        sections: [
          { title: undefined, rows: [ { label: "Email Notifications", value: "Enabled" }, { label: "Push Notifications", value: "Disabled" } ] },
        ],
      };
    }

    return {
      title: "Customize",
      sections: [
        { title: undefined, rows: [ { label: "Theme", value: "Golden" }, { label: "Compact Layout", value: "Off" } ] },
      ],
    };
  }, [active, account]);
}