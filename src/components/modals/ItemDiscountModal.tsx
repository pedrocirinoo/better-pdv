"use client";

import { useState, useEffect } from "react";
import { CartItem } from "@/lib/types";

interface ItemDiscountModalProps {
  open: boolean;
  item: CartItem | null;
  onConfirm: (itemId: number, pct: number) => void;
  onClose: () => void;
}

const QUICK_PCTS = [5, 10, 15, 20, 50];

export function ItemDiscountModal({ open, item, onConfirm, onClose }: ItemDiscountModalProps) {
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (open) {
      setMounted(true);
      setValue(item?.itemDiscount ? String(item.itemDiscount) : "");
    } else {
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [open, item]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") handleConfirm();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, value]);

  if (!mounted || !item) return null;

  const pct = parseFloat(value) || 0;
  const originalTotal = item.price * item.qty;
  const discountValue = (originalTotal * pct) / 100;
  const newTotal = originalTotal - discountValue;
  const valid = pct > 0 && pct <= 100;

  function handleConfirm() {
    if (!valid) return;
    onConfirm(item!.id, pct);
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm modal-overlay ${open ? "open" : ""}`}
      onClick={onClose}
    >
      <div
        data-tour="item-discount-modal"
        onClick={(e) => e.stopPropagation()}
        className="modal-panel relative w-full max-w-xs bg-surface-lowest rounded-xl shadow-ambient-lg p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-base">Desconto no item</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-surface-low transition-colors text-onsurface-variant">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-onsurface-variant mb-3 truncate">{item.name}</p>

        {/* Quick pct buttons */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {QUICK_PCTS.map((p) => (
            <button
              key={p}
              onClick={() => setValue(String(p))}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                pct === p ? "bg-navy text-white" : "bg-surface-low hover:bg-surface-high text-onsurface-variant"
              }`}
            >
              {p}%
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="relative mb-4">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0"
            autoFocus
            className="w-full pl-3 pr-8 py-3 text-xl font-display font-bold text-center rounded-lg border border-surface-high bg-surface focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy transition-colors"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg font-bold text-onsurface-variant">%</span>
        </div>

        {/* Preview */}
        {valid && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-surface-low text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-onsurface-variant">Subtotal original</span>
              <span>R$ {originalTotal.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between text-success font-semibold">
              <span>Desconto ({pct}%)</span>
              <span>- R$ {discountValue.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-surface-high/50 pt-1">
              <span>Novo subtotal</span>
              <span>R$ {newTotal.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {item.itemDiscount && (
            <button
              onClick={() => onConfirm(item.id, 0)}
              className="px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-surface-high rounded-lg transition-colors"
            >
              Remover
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm text-onsurface-variant hover:text-onsurface border border-surface-high rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!valid}
            className="flex-1 py-2.5 text-sm font-semibold text-white btn-cta rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
