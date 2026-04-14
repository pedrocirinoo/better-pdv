"use client";

import { useState, useEffect } from "react";

interface ReceiptModalProps {
  open: boolean;
  itemCount: number;
  total: number;
  method: string;
  saleNumber?: number;
  onClose: () => void;
}

const methodLabels: Record<string, string> = {
  pix: "Pix",
  credito: "Crédito",
  debito: "Débito",
  dinheiro: "Dinheiro",
  vale: "Vale",
};

export function ReceiptModal({ open, itemCount, total, method, saleNumber, onClose }: ReceiptModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
    } else {
      const t = setTimeout(() => setMounted(false), 500);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm receipt-overlay ${open ? "open" : ""}`} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="receipt-panel bg-white dark:bg-surface-lowest rounded-xl shadow-ambient-lg w-full max-w-xs p-6 text-center"
      >
        {/* Success check */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center"
            style={{ animation: "check-pop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) 150ms both" }}>
            <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
              style={{ opacity: 0, animation: "check-fade 300ms ease 400ms forwards" }}>
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {saleNumber !== undefined && (
          <p className="text-[10px] font-mono text-onsurface-variant mb-1 tracking-wider">
            VENDA #{String(saleNumber).padStart(3, "0")}
          </p>
        )}
        <p className="text-sm text-onsurface-variant mb-1">Pagamento confirmado</p>
        <p className="text-3xl font-display font-bold mb-1">R$ {total.toFixed(2).replace(".", ",")}</p>
        <p className="text-sm text-onsurface-variant mb-4">
          {methodLabels[method] || method} · {itemCount} {itemCount === 1 ? "item" : "itens"}
        </p>

        <button
          onClick={onClose}
          className="w-full py-2.5 text-sm font-semibold text-white btn-cta rounded-lg transition-all active:scale-[0.98]"
        >
          Próximo cliente
        </button>
      </div>
    </div>
  );
}
