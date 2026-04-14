"use client";

import { useState, useMemo } from "react";
import { Product } from "@/lib/types";

interface SearchPanelProps {
  products: Product[];
  onAddItem: (product: Product) => void;
}

export function SearchPanel({ products, onAddItem }: SearchPanelProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.code.includes(q)
    );
  }, [query, products]);

  return (
    <aside className="w-80 border-l border-surface-high flex flex-col bg-surface-lowest shrink-0 hidden lg:flex" data-tour="search">
      <div className="px-4 h-11 border-b border-surface-high flex items-center">
        <div className="relative flex-1">
          <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-onsurface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                const exact = products.find((p) => p.code === query.trim());
                const target = exact ?? (filtered.length === 1 ? filtered[0] : null);
                if (target) {
                  onAddItem(target);
                  setQuery("");
                }
              }
            }}
            placeholder="Buscar produto ou código..."
            className="w-full pl-6 pr-2 py-1 text-sm bg-transparent border-none focus:outline-none placeholder:text-onsurface-variant"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-onsurface-variant py-8">Nenhum produto encontrado</p>
        ) : (
          filtered.map((product) => (
            <button
              key={product.code}
              onClick={() => onAddItem(product)}
              className="w-full text-left px-3 py-2.5 rounded-md hover:bg-surface-low transition-colors group"
            >
              <p className="text-sm font-medium group-hover:text-navy transition-colors">{product.name}</p>
              <div className="flex justify-between mt-0.5">
                <span className="text-xs text-onsurface-variant">{product.code}</span>
                <span className="text-xs font-semibold text-navy">
                  R$ {product.price.toFixed(2).replace(".", ",")}{product.unit === "kg" ? "/kg" : ""}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
