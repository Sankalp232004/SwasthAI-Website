import React from "react";
import { Info, Lightbulb, AlertTriangle, ShieldAlert } from "lucide-react";

interface CalloutProps {
  type?: "info" | "tip" | "warning" | "caution";
  title?: string;
  children: React.ReactNode;
}

export default function Callout({ type = "info", title, children }: CalloutProps) {
  const styles = {
    info: {
      border: "border-teal-500/40 bg-teal-50/50 text-teal-950",
      icon: <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />,
      defaultTitle: "Note",
    },
    tip: {
      border: "border-emerald-500/40 bg-emerald-50/50 text-emerald-950",
      icon: <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
      defaultTitle: "Pro Tip",
    },
    warning: {
      border: "border-amber-500/40 bg-amber-50/50 text-amber-950",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
      defaultTitle: "Important Notice",
    },
    caution: {
      border: "border-rose-500/40 bg-rose-50/50 text-rose-950",
      icon: <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
      defaultTitle: "Caution",
    },
  };

  const current = styles[type] || styles.info;

  return (
    <div className={`my-6 p-4 sm:p-5 rounded-2xl border-l-4 border ${current.border} shadow-xs flex items-start gap-3.5`}>
      {current.icon}
      <div className="space-y-1 text-sm leading-relaxed">
        {(title || current.defaultTitle) && (
          <h4 className="font-bold text-xs uppercase tracking-wider opacity-90">{title || current.defaultTitle}</h4>
        )}
        <div className="font-medium">{children}</div>
      </div>
    </div>
  );
}
