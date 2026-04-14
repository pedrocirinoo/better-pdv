"use client";

import { useState, useEffect } from "react";
import { Operator, Purchase } from "@/lib/types";

interface OperatorPanelModalProps {
  open: boolean;
  operator: Operator | null;
  onClose: () => void;
  onRefund?: (purchaseIndex: number) => void;
}

type FilterMode = "dia" | "mes" | "ano";

const methodLabels: Record<string, string> = {
  pix: "Pix",
  credito: "Crédito",
  debito: "Débito",
  dinheiro: "Dinheiro",
  vale: "Vale",
};

function matchesFilter(purchase: Purchase, mode: FilterMode, ref: Date): boolean {
  const d = new Date(purchase.date);
  if (mode === "ano") return d.getFullYear() === ref.getFullYear();
  if (mode === "mes") return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate();
}

function shiftDate(date: Date, mode: FilterMode, delta: number): Date {
  const d = new Date(date);
  if (mode === "dia") d.setDate(d.getDate() + delta);
  else if (mode === "mes") d.setMonth(d.getMonth() + delta);
  else d.setFullYear(d.getFullYear() + delta);
  return d;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-surface-high ${className ?? ""}`} />;
}

export function OperatorPanelModal({ open, operator, onClose, onRefund }: OperatorPanelModalProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>("dia");
  const [filterDate, setFilterDate] = useState(new Date());
  const [refundConfirm, setRefundConfirm] = useState<number | null>(null);

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
      setFilterMode("dia");
      setFilterDate(new Date());
      setRefundConfirm(null);
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!mounted) return null;
  if (!operator) return null;

  const filtered = operator.history.filter((p) => matchesFilter(p, filterMode, filterDate));
  const totalFiltered = filtered.reduce((s, p) => s + p.total, 0);
  const totalItems = filtered.reduce((s, p) => s + p.itemCount, 0);

  const byMethod: Record<string, { count: number; total: number }> = {};
  for (const p of filtered) {
    const key = Array.isArray(p.paymentMethod) ? p.paymentMethod.join(" + ") : p.paymentMethod;
    if (!byMethod[key]) byMethod[key] = { count: 0, total: 0 };
    byMethod[key].count++;
    byMethod[key].total += p.total;
  }

  return (
    <div className={`fixed inset-0 z-50 flex justify-end drawer-overlay ${open ? "open" : ""}`} onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Histórico de vendas"
        onClick={(e) => e.stopPropagation()}
        className="drawer-panel relative w-full max-w-sm bg-surface-lowest h-full flex flex-col shadow-ambient-lg"
      >
        {loading ? (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex gap-1">
              <Skeleton className="flex-1 h-8 rounded-md" />
              <Skeleton className="flex-1 h-8 rounded-md" />
              <Skeleton className="flex-1 h-8 rounded-md" />
            </div>
            <Skeleton className="h-8 w-full rounded-md" />
            <div className="rounded-lg bg-surface-low p-4 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-2 w-3/4 rounded-full" />
            </div>
            <Skeleton className="h-3 w-16" />
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-5" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-3.5 w-16" />
              </div>
            ))}
          </div>
        ) : (
        <div className="flex flex-col h-full">
        {/* Header */}
        <div className="shrink-0 p-5 border-b border-surface-high">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{operator.initials}</span>
              </div>
              <div>
                <h2 className="font-display font-bold text-base leading-tight">{operator.name}</h2>
                <p className="text-[10px] text-onsurface-variant mt-0.5">Histórico de vendas</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-surface-low transition-colors text-onsurface-variant">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filtro por período */}
          <div className="flex gap-1 mb-3">
            {(["dia", "mes", "ano"] as FilterMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setFilterMode(m); setFilterDate(new Date()); }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterMode === m
                    ? "bg-navy text-white"
                    : "bg-surface-low text-onsurface-variant hover:text-onsurface"
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          {/* Navegação de data */}
          {filterMode === "dia" ? (
            <div className="mb-4">
              <input
                type="date"
                value={filterDate.toISOString().split("T")[0]}
                onChange={(e) => { if (e.target.value) setFilterDate(new Date(e.target.value + "T12:00:00")); }}
                className="w-full px-3 py-2 text-sm rounded-md border border-surface-high bg-surface focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy transition-colors"
              />
            </div>
          ) : filterMode === "mes" ? (
            <div className="mb-4">
              <input
                type="month"
                value={`${filterDate.getFullYear()}-${String(filterDate.getMonth() + 1).padStart(2, "0")}`}
                onChange={(e) => { if (e.target.value) setFilterDate(new Date(e.target.value + "-15T12:00:00")); }}
                className="w-full px-3 py-2 text-sm rounded-md border border-surface-high bg-surface focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy transition-colors"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setFilterDate((d) => shiftDate(d, filterMode, -1))}
                className="p-1 rounded-md hover:bg-surface-low transition-colors text-onsurface-variant"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-medium">{filterDate.getFullYear()}</span>
              <button
                onClick={() => setFilterDate((d) => shiftDate(d, filterMode, 1))}
                className="p-1 rounded-md hover:bg-surface-low transition-colors text-onsurface-variant"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Resumo */}
          <div className="bg-surface-low rounded-lg p-4">
            <p className="text-xs text-onsurface-variant mb-1">{filtered.length} vendas · {totalItems} itens</p>
            <p className="text-3xl font-display font-bold tracking-tight mb-3">
              R$ {totalFiltered.toFixed(2).replace(".", ",")}
            </p>

            {Object.keys(byMethod).length > 0 && (() => {
              const maxVal = Math.max(...Object.values(byMethod).map(d => d.total));
              const methodColors: Record<string, string> = {
                pix: "bg-emerald-500",
                credito: "bg-blue-500",
                debito: "bg-indigo-400",
                dinheiro: "bg-amber-500",
                vale: "bg-purple-500",
              };
              return (
                <div className="space-y-2.5">
                  {Object.entries(byMethod).sort((a, b) => b[1].total - a[1].total).map(([method, data]) => (
                    <div key={method}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-onsurface-variant">{methodLabels[method] || method} ({data.count})</span>
                        <span className="text-xs font-semibold">R$ {data.total.toFixed(2).replace(".", ",")}</span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-high overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${methodColors[method] || "bg-navy"}`}
                          style={{ width: `${(data.total / maxVal) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Lista de vendas */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-3">
            <p className="text-xs font-semibold text-onsurface-variant uppercase tracking-wider">Vendas</p>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-onsurface-variant text-center py-12">Nenhuma venda neste período</p>
          ) : (
            <div className="px-5 pb-5 space-y-1.5">
              {[...filtered].reverse().map((p, i) => {
                const idx = filtered.length - i;
                const originalIdx = operator!.history.indexOf(p);
                return (
                  <div key={i} className={`px-3 py-2.5 rounded-lg transition-colors ${p.refunded ? "opacity-60" : "hover:bg-surface-low"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-onsurface-variant w-5 text-right">#{idx}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{p.time} — {p.itemCount} {p.itemCount === 1 ? "item" : "itens"}</p>
                            {p.refunded && (
                              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Estornado</span>
                            )}
                          </div>
                          <p className="text-xs text-onsurface-variant">{Array.isArray(p.paymentMethod) ? p.paymentMethod.map(m => methodLabels[m] || m).join(" + ") : (methodLabels[p.paymentMethod] || p.paymentMethod)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${p.refunded ? "line-through text-onsurface-variant" : ""}`}>R$ {p.total.toFixed(2).replace(".", ",")}</span>
                        {!p.refunded && onRefund && (
                          <button
                            onClick={() => setRefundConfirm(originalIdx)}
                            className="p-1 rounded-md text-onsurface-variant hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Estornar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {refundConfirm === originalIdx && (
                      <div className="mt-2 p-2.5 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                        <p className="text-xs text-red-700 dark:text-red-400 mb-2">Confirmar estorno de R$ {p.total.toFixed(2).replace(".", ",")}?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setRefundConfirm(null)}
                            className="flex-1 py-1.5 text-xs text-onsurface-variant hover:text-onsurface border border-surface-high rounded-md transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => { onRefund?.(originalIdx); setRefundConfirm(null); }}
                            className="flex-1 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                          >
                            Estornar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </div>
        )}
      </div>
    </div>
  );
}
