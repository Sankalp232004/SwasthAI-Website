import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const jsonLdList = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_CONFIG.url,
    },
    ...items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 2,
      name: item.label,
      item: item.href ? `${SITE_CONFIG.url}${item.href}` : undefined,
    })),
  ];

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: jsonLdList,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <nav aria-label="Breadcrumb" className="py-2 text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-teal-600 flex items-center gap-1 transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>

        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            {item.href ? (
              <Link href={item.href} className="hover:text-teal-600 transition-colors font-medium">
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-[300px]">
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </>
  );
}
