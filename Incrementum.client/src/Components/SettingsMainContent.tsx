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
    <div className="account-card bg-[hsl(40,63%,63%)] rounded p-8 w-full mt-0 relative">
      {actions}
      {title && <h2 className="text-2xl font-bold mb-4 text-[hsl(40,46%,36%)]">{title}</h2>}

      {sections.map((section, si) => (
        <div className="mt-4" key={si}>
          {section.title && (
            <>
              <h3 className="text-lg font-medium text-[hsl(40,46%,36%)]">{section.title}</h3>
              <div className="border-t border-[hsl(40,46%,36%)] my-3" />
            </>
          )}

          <div className="space-y-4">
            {section.rows.map((row, ri) => (
              <div className="flex items-center justify-between" key={row.id ?? ri}>
                <div className="text-base text-[hsl(40,46%,36%)]">{row.label}</div>
                <div className="inline-flex items-center px-3 py-2 bg-[hsl(40,61%,55%)] text-[hsl(40,62%,26%)]">
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