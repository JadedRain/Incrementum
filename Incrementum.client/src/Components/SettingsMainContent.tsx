import React from "react";

type Row = {
  id?: string;
  label: string;
  value: React.ReactNode;
};

type Section = {
  title?: string;
  rows: Row[];
};

type Props = {
  title?: string;
  sections: Section[];
  actions?: React.ReactNode;
};

const SettingsMainContent: React.FC<Props> = ({ title, sections, actions }) => {
  return (
    <div className="account-card bg-[var(--bg-surface)] rounded p-8 w-full mt-0 relative">
      {actions}
      {title && <h2 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">{title}</h2>}

      {sections.map((section, si) => (
        <div className="mt-4" key={si}>
          {section.title && (
            <>
              <h3 className="text-lg font-medium text-[var(--text-primary)]">{section.title}</h3>
              <div className="border-t border-[var(--text-primary)] my-3" />
            </>
          )}

          <div className="space-y-4">
            {section.rows.map((row, ri) => (
              <div className="flex items-center justify-between" key={row.id ?? ri}>
                <div className="text-base text-[var(--text-primary)]">{row.label}</div>
                <div className="inline-flex items-center px-3 py-2 bg-[var(--bg-surface)] text-[var(--text-primary)]">
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SettingsMainContent;