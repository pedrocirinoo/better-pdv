"use client";

import { Operator } from "@/lib/types";

interface HistoryModalProps {
  open: boolean;
  operator: Operator | null;
  onClose: () => void;
}

export function HistoryModal({ open, operator, onClose }: HistoryModalProps) {
  if (!open || !operator) return null;

  const totalSales = operator.history.reduce((s, p) => s + p.total, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-surface-lowest rounded-xl shadow-ambient-lg w-full max-w-md p-6 max-h-[70vh] flex flex-col">
        <h2 className="font-display font-bold text-lg mb-1">Histórico</h2>
        <p className="text-sm text-onsurface-variant mb-4">{operator.name} — {operator.history.length} vendas — R$ {totalSales.toFixed(2).replace(".", ",")}</p>

        <div className="flex-1 overflow-y-auto space-y-2">
          {operator.history.length === 0 ? (
            <p className="text-sm text-onsurface-variant text-center py-8">Nenhuma venda registrada</p>
          ) : (
            operator.history.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-surface-high">
                <div>
                  <p className="text-sm font-medium">Venda #{i + 1}</p>
                  <p className="text-xs text-onsurface-variant">{p.time} — {p.itemCount} itens — {p.paymentMethod}</p>
                </div>
                <span className="text-sm font-semibold">R$ {p.total.toFixed(2).replace(".", ",")}</span>
              </div>
            ))
          )}
        </div>

        <button onClick={onClose} className="w-full mt-4 py-2 text-sm text-onsurface-variant hover:text-onsurface transition-colors">
          Fechar
        </button>
      </div>
    </div>
  );
}
