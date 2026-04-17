"use client";

import { useState, useEffect } from "react";

interface DiscountModalProps {
  open: boolean;
  subtotal: number;
  onApply: (discount: number) => void;
  onClose: () => void;
}

const percentPresets = [5, 10, 15, 20];
const fixedPresets = [5, 10, 20, 50];

export function DiscountModal({ open, subtotal, onApply, onClose }: DiscountModalProps) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");

  useEffect(() => {
    if (open) {
      setMounted(true);
    } else {
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setMode("percent");
      setValue("");
    }
  }, [open]);

  if (!mounted) return null;

  const numValue = parseFloat(value.replace(",", ".")) || 0;

  const discountAmount =
    mode === "percent"
      ? Math.round(subtotal * (numValue / 100) * 100) / 100
      : numValue;

  const newTotal = subtotal - discountAmount;
  const isValid = numValue > 0 && discountAmount <= subtotal;

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm modal-overlay ${open ? "open" : ""}`}
      onClick={onClose}
    >
      <div
        data-tour="discount-modal"
        onClick={(e) => e.stopPropagation()}
        className="modal-panel bg-surface-lowest rounded-xl shadow-ambient-lg w-full max-w-sm p-6"
      >
        <h2 className="font-display font-bold text-lg mb-4">Desconto</h2>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setMode("percent"); setValue(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-colors ${
              mode === "percent"
                ? "bg-navy text-white border-navy"
                : "border-surface-high text-onsurface-variant hover:text-onsurface"
            }`}
          >
            %
          </button>
          <button
            onClick={() => { setMode("fixed"); setValue(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-colors ${
              mode === "fixed"
                ? "bg-navy text-white border-navy"
                : "border-surface-high text-onsurface-variant hover:text-onsurface"
            }`}
          >
            R$
          </button>
        </div>

        {/* Input */}
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-onsurface-variant text-sm">
            {mode === "percent" ? "%" : "R$"}
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={mode === "percent" ? "0" : "0,00"}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-high bg-surface-lowest text-onsurface text-right text-lg font-display focus:outline-none focus:ring-2 focus:ring-navy/30"
          />
        </div>

        {/* Quick buttons */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {(mode === "percent" ? percentPresets : fixedPresets).map((preset) => (
            <button
              key={preset}
              onClick={() => setValue(mode === "percent" ? String(preset) : preset.toFixed(2).replace(".", ","))}
              className="py-1.5 text-sm rounded-lg border border-surface-high text-onsurface-variant hover:text-onsurface hover:bg-surface-low transition-colors"
            >
              {mode === "percent" ? `${preset}%` : `R$${preset}`}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="rounded-lg border border-surface-high p-3 mb-5 space-y-1 text-sm">
          <div className="flex justify-between text-onsurface-variant">
            <span>Subtotal</span>
            <span>R$ {fmt(subtotal)}</span>
          </div>
          <div className="flex justify-between text-navy font-semibold">
            <span>Desconto</span>
            <span>- R$ {fmt(discountAmount)}</span>
          </div>
          <div className="flex justify-between text-onsurface font-bold pt-1 border-t border-surface-high">
            <span>Novo total</span>
            <span>R$ {fmt(Math.max(0, newTotal))}</span>
          </div>
        </div>

        {/* Validation error */}
        {numValue > 0 && discountAmount > subtotal && (
          <p className="text-xs text-red-600 text-center mb-3">
            O desconto não pode exceder o subtotal
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm text-onsurface-variant hover:text-onsurface border border-surface-high rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            disabled={!isValid}
            onClick={() => onApply(discountAmount)}
            className="flex-1 py-2 text-sm font-semibold text-white btn-cta rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Aplicar Desconto
          </button>
        </div>
      </div>
    </div>
  );
}
