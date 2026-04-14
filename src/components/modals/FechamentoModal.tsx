"use client";

import { Operator } from "@/lib/types";

interface FechamentoModalProps {
  open: boolean;
  operators: Operator[];
  onClose: () => void;
}

export function FechamentoModal({ open, operators, onClose }: FechamentoModalProps) {
  if (!open) return null;

  const grandTotal = operators.reduce((s, op) => s + op.history.reduce((t, p) => t + p.total, 0), 0);
  const totalSales = operators.reduce((s, op) => s + op.history.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-surface-lowest rounded-xl shadow-ambient-lg w-full max-w-md p-6">
        <h2 className="font-display font-bold text-lg mb-1">Fechamento de Caixa</h2>
        <p className="text-sm text-onsurface-variant mb-6">Resumo do turno</p>

        <div className="space-y-3 mb-6">
          {operators.map((op) => {
            const opTotal = op.history.reduce((s, p) => s + p.total, 0);
            return (
              <div key={op.id} className="flex items-center justify-between p-3 rounded-lg border border-surface-high">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-surface-high flex items-center justify-center">
                    <span className="text-xs font-semibold">{op.initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{op.name}</p>
                    <p className="text-xs text-onsurface-variant">{op.history.length} vendas</p>
                  </div>
                </div>
                <span className="text-sm font-semibold">R$ {opTotal.toFixed(2).replace(".", ",")}</span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-surface-high pt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-onsurface-variant">{totalSales} vendas no total</p>
            <p className="text-lg font-display font-bold">R$ {grandTotal.toFixed(2).replace(".", ",")}</p>
          </div>
          <div className="px-3 py-1 rounded-full bg-success-chip text-success-chip-text text-xs font-semibold">
            Caixa aberto
          </div>
        </div>

        <button onClick={onClose} className="w-full mt-4 py-2 text-sm text-onsurface-variant hover:text-onsurface transition-colors">
          Fechar
        </button>
      </div>
    </div>
  );
}
