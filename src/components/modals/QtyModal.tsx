"use client";

import { useState, useEffect } from "react";
import { CartItem } from "@/lib/types";

interface QtyModalProps {
  open: boolean;
  item: CartItem | null;
  onConfirm: (qty: number) => void;
  onClose: () => void;
}

export function QtyModal({ open, item, onConfirm, onClose }: QtyModalProps) {
  const [mounted, setMounted] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (open) {
      setMounted(true);
    } else {
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (open && item) setQty(item.qty);
  }, [open, item]);

  if (!mounted) return null;
  if (!item) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm modal-overlay ${open ? "open" : ""}`} onClick={onClose}>
      <div data-tour="qty-modal" onClick={(e) => e.stopPropagation()} className="modal-panel bg-surface-lowest rounded-xl shadow-ambient-lg w-full max-w-xs p-6">
        <h2 className="font-display font-bold text-lg mb-1">Quantidade</h2>
        <p className="text-sm text-onsurface-variant mb-6 truncate">{item.name}</p>

        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => setQty((q) => Math.max(0, q - 1))}
            className="w-10 h-10 rounded-lg border border-surface-high flex items-center justify-center hover:bg-surface-low transition-colors text-lg font-bold"
          >
            −
          </button>
          <span className="text-3xl font-display font-bold w-16 text-center">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="w-10 h-10 rounded-lg border border-surface-high flex items-center justify-center hover:bg-surface-low transition-colors text-lg font-bold"
          >
            +
          </button>
        </div>

        {qty === 0 && (
          <p className="text-xs text-red-600 text-center mb-3">Confirmar removerá o item</p>
        )}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-sm text-onsurface-variant hover:text-onsurface border border-surface-high rounded-lg transition-colors">
            Cancelar
          </button>
          <button onClick={() => onConfirm(qty)} className="flex-1 py-2 text-sm font-semibold text-white btn-cta rounded-lg">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
