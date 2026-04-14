"use client";

import { useEffect, useRef } from "react";

interface ContextMenuProps {
  x: number;
  y: number;
  onAction: (action: string) => void;
  onClose: () => void;
}

const actions = [
  { key: "qty", label: "Alterar quantidade", icon: "M7 20l4-16m2 16l4-16M6 9h14M4 15h14" },
  { key: "price", label: "Consultar preço", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "remove", label: "Remover item", icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" },
];

export function ContextMenu({ x, y, onAction, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{ top: y, left: x }}
      className="fixed z-50 bg-surface-lowest rounded-lg shadow-ambient-lg border border-surface-high py-1 min-w-[180px] animate-in fade-in zoom-in-95 duration-100"
    >
      {actions.map((a) => (
        <button
          key={a.key}
          onClick={() => onAction(a.key)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-surface-low transition-colors ${a.key === "remove" ? "text-red-600" : ""}`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={a.icon} />
          </svg>
          {a.label}
        </button>
      ))}
    </div>
  );
}
