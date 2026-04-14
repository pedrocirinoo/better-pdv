"use client";

import { useState, useEffect } from "react";
import { Operator } from "@/lib/types";

interface OperatorModalProps {
  open: boolean;
  operators: Operator[];
  currentOperator: Operator;
  onSelect: (op: Operator) => void;
  onClose: () => void;
}

export function OperatorModal({ open, operators, currentOperator, onSelect, onClose }: OperatorModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
    } else {
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!mounted) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm modal-overlay ${open ? "open" : ""}`} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Selecionar operador" onClick={(e) => e.stopPropagation()} className="modal-panel bg-surface-lowest rounded-xl shadow-ambient-lg w-full max-w-sm p-6">
        <h2 className="font-display font-bold text-lg mb-4">Operadores</h2>

        <div className="space-y-2">
          {operators.map((op) => (
            <button
              key={op.id}
              onClick={() => onSelect(op)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                op.id === currentOperator.id
                  ? "border-navy bg-navy/5"
                  : "border-surface-high hover:border-navy/30"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                op.id === currentOperator.id ? "bg-navy" : "bg-surface-high"
              }`}>
                <span className={`text-xs font-semibold ${op.id === currentOperator.id ? "text-white" : ""}`}>
                  {op.initials}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">{op.name}</p>
                <p className="text-xs text-onsurface-variant">{op.history.length} vendas</p>
              </div>
            </button>
          ))}
        </div>

        <button onClick={onClose} className="w-full mt-4 py-2 text-sm text-onsurface-variant hover:text-onsurface transition-colors">
          Fechar
        </button>
      </div>
    </div>
  );
}
