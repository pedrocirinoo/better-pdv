"use client";

import { useRef, useEffect } from "react";
import { CartItem } from "@/lib/types";

interface ItemListProps {
  items: CartItem[];
  onContextMenu: (x: number, y: number, itemId: number) => void;
}

export function ItemList({ items, onContextMenu }: ItemListProps) {
  const prevIdsRef = useRef<Set<number>>(new Set());
  const newIdsRef = useRef<Set<number>>(new Set());
  const bumpIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const prevIds = prevIdsRef.current;
    const currentIds = new Set(items.map(i => i.id));
    newIdsRef.current = new Set<number>();
    bumpIdsRef.current = new Set<number>();

    for (const item of items) {
      if (!prevIds.has(item.id)) {
        newIdsRef.current.add(item.id);
      }
    }

    // Detect qty changes (item existed but was updated)
    for (const item of items) {
      if (prevIds.has(item.id)) {
        bumpIdsRef.current.add(item.id);
      }
    }

    prevIdsRef.current = currentIds;
  }, [items]);
  return (
    <section className="flex-1 flex flex-col overflow-hidden" data-tour="cart">
      {/* Table header */}
      <div className="grid grid-cols-[2rem_1fr_3rem_5rem] md:grid-cols-[3rem_1fr_5rem_6rem_6rem] px-3 md:px-6 h-11 items-center text-xs font-semibold text-onsurface-variant uppercase tracking-wider border-b border-surface-high bg-surface-low">
        <span>#</span>
        <span>Produto</span>
        <span className="text-right">Qtd</span>
        <span className="text-right hidden md:block">Unit.</span>
        <span className="text-right">Subtotal</span>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-onsurface-variant">
            <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <p className="text-sm">Nenhum item escaneado</p>
            <p className="text-xs mt-1 opacity-60">Escaneie um produto ou busque ao lado</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div
              key={item.id}
              onContextMenu={(e) => { e.preventDefault(); onContextMenu(e.clientX, e.clientY, item.id); }}
              className={`grid grid-cols-[2rem_1fr_3rem_5rem] md:grid-cols-[3rem_1fr_5rem_6rem_6rem] px-3 md:px-6 py-3 items-center border-b border-surface-high/50 hover:bg-surface-low/50 transition-colors cursor-context-menu ${newIdsRef.current.has(item.id) ? "cart-item-enter" : ""}`}
            >
              <span className="text-xs text-onsurface-variant">{String(idx + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-sm font-medium leading-tight">{item.name}</p>
                <p className="text-xs text-onsurface-variant">
                  {item.code}
                  {item.weight && <span className="ml-1.5 text-navy font-medium">{item.weight.toFixed(3)}kg</span>}
                </p>
              </div>
              <span className={`text-right text-sm font-medium ${bumpIdsRef.current.has(item.id) ? "qty-bump" : ""}`}>{item.weight ? `${item.weight.toFixed(3)}kg` : item.qty}</span>
              <span className="text-right text-sm text-onsurface-variant hidden md:block">
                {item.price.toFixed(2).replace(".", ",")}
              </span>
              <div className="text-right">
                {item.itemDiscount ? (
                  <>
                    <span className="block text-xs line-through text-onsurface-variant leading-none">
                      {(item.price * item.qty).toFixed(2).replace(".", ",")}
                    </span>
                    <span className="block text-sm font-semibold text-success leading-tight">
                      {(item.price * item.qty * (1 - item.itemDiscount / 100)).toFixed(2).replace(".", ",")}
                    </span>
                    <span className="block text-[10px] text-success/80 leading-none">-{item.itemDiscount}%</span>
                  </>
                ) : (
                  <span className="text-sm font-semibold">
                    {(item.price * item.qty).toFixed(2).replace(".", ",")}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
