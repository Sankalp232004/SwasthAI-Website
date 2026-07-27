"use client";

import React, { useEffect, useState } from "react";
import { List } from "lucide-react";
import { TOCItem } from "@/lib/mdx";

interface TableOfContentsProps {
  toc: TOCItem[];
}

export default function TableOfContents({ toc }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!toc.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0.1 }
    );

    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  if (!toc.length) return null;

  return (
    <nav className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 sticky top-28">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0F2C59]">
        <List className="w-4 h-4 text-teal-600" />
        <span>Table of Contents</span>
      </div>

      <ul className="space-y-2 text-xs font-medium border-l border-slate-200 pl-3">
        {toc.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-3" : ""}>
            <a
              href={`#${item.id}`}
              className={`block transition-colors hover:text-teal-600 truncate max-w-[200px] ${
                activeId === item.id
                  ? "text-teal-600 font-bold -ml-3.5 border-l-2 border-teal-600 pl-2.5"
                  : "text-slate-600"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
