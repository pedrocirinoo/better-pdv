"use client";

import { useState, useEffect } from "react";
import { Operator } from "@/lib/types";

interface FechamentoDrawerProps {
  open: boolean;
  operator: Operator | null;
  onClose: () => void;
}

type Status = "pendente" | "conferindo" | "conferido";

const methodLabels: Record<string, string> = {
  pix: "Pix",
  credito: "Crédito",
  debito: "Débito",
  dinheiro: "Dinheiro",
  vale: "Vale",
};

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-surface-high ${className ?? ""}`} />;
}

export function FechamentoDrawer({ open, operator, onClose }: FechamentoDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status>("pendente");
  const [valorInformado, setValorInformado] = useState("");
  const [printing, setPrinting] = useState(false);

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
      setStatus("pendente");
      setValorInformado("");
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!mounted) return null;
  if (!operator) return null;

  const hoje = new Date();
  const vendasHoje = operator.history.filter(p => {
    const d = new Date(p.date);
    return d.getFullYear() === hoje.getFullYear() && d.getMonth() === hoje.getMonth() && d.getDate() === hoje.getDate();
  });

  const totalGeral = vendasHoje.reduce((s, p) => s + p.total, 0);
  const totalItems = vendasHoje.reduce((s, p) => s + p.itemCount, 0);
  const totalDinheiro = vendasHoje.filter(p => p.paymentMethod === "dinheiro" || (Array.isArray(p.paymentMethod) && p.paymentMethod.includes("dinheiro"))).reduce((s, p) => s + p.total, 0);
  const esperadoCaixa = operator.fundoCaixa + totalDinheiro;

  const byMethod: Record<string, { count: number; total: number }> = {};
  for (const p of vendasHoje) {
    const key = Array.isArray(p.paymentMethod) ? p.paymentMethod.join(" + ") : p.paymentMethod;
    if (!byMethod[key]) byMethod[key] = { count: 0, total: 0 };
    byMethod[key].count++;
    byMethod[key].total += p.total;
  }

  const valorNum = parseFloat(valorInformado.replace(",", ".")) || 0;
  const diferenca = valorNum - esperadoCaixa;
  const bateu = Math.abs(diferenca) < 0.01;

  return (
    <div className={`fixed inset-0 z-50 flex justify-end drawer-overlay ${open ? "open" : ""}`} onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />

      <div
        data-tour="fechamento-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Fechamento de caixa"
        onClick={(e) => e.stopPropagation()}
        className="drawer-panel relative w-full max-w-sm bg-surface-lowest h-full flex flex-col shadow-ambient-lg"
      >
        {printing && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium rounded-lg shadow-ambient-lg">
            <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659" />
            </svg>
            Imprimindo fechamento...
          </div>
        )}
        {loading ? (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
            <div className="rounded-lg bg-surface-low p-4 space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-2 w-2/3 rounded-full" />
            </div>
            <div className="rounded-lg bg-surface-low p-4 space-y-2">
              <Skeleton className="h-3 w-24" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
            <div className="flex flex-col items-center py-8">
              <Skeleton className="w-12 h-12 rounded-full mb-4" />
              <Skeleton className="h-3 w-40 mb-1" />
              <Skeleton className="h-3 w-48 mb-6" />
              <Skeleton className="h-10 w-40 rounded-lg" />
            </div>
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
                <p className="text-[10px] text-onsurface-variant mt-0.5">Fechamento de caixa — {hoje.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setPrinting(true); setTimeout(() => setPrinting(false), 1800); }}
                disabled={printing || vendasHoje.length === 0}
                className="p-1.5 rounded-md hover:bg-surface-low transition-colors text-onsurface-variant disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Imprimir fechamento"
                title="Imprimir fechamento"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                </svg>
              </button>
              <button onClick={onClose} className="p-1.5 rounded-md hover:bg-surface-low transition-colors text-onsurface-variant">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Resumo geral do turno */}
          <div className="bg-surface-low rounded-lg p-4 mb-4">
            <p className="text-xs text-onsurface-variant mb-1">{vendasHoje.length} vendas hoje · {totalItems} itens</p>
            <p className="text-3xl font-display font-bold tracking-tight mb-3">
              R$ {totalGeral.toFixed(2).replace(".", ",")}
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

          {/* Dinheiro em caixa */}
          <div className="bg-surface-low rounded-lg p-4">
            <p className="text-xs font-semibold text-onsurface-variant uppercase tracking-wider mb-3">Dinheiro em caixa</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-onsurface-variant">Fundo de caixa</span>
                <span className="font-semibold">R$ {operator.fundoCaixa.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-onsurface-variant">Vendas em dinheiro</span>
                <span className="font-semibold">R$ {totalDinheiro.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-surface-high/50">
                <span className="font-semibold">Esperado no caixa</span>
                <span className="font-bold text-sm">R$ {esperadoCaixa.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conferência */}
        <div className="flex-1 overflow-y-auto p-5">
          {status === "pendente" && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-12 h-12 text-onsurface-variant/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
              <p className="text-sm text-onsurface-variant mb-1">Conte o dinheiro no caixa</p>
              <p className="text-xs text-onsurface-variant/60 mb-6">Informe o valor total contado para conferir</p>
              <button
                onClick={() => setStatus("conferindo")}
                className="px-6 py-2.5 text-sm font-semibold rounded-lg border-2 border-navy text-navy hover:bg-navy/5 transition-colors"
              >
                Iniciar conferência
              </button>
            </div>
          )}

          {status === "conferindo" && (
            <div>
              <p className="text-xs font-semibold text-onsurface-variant uppercase tracking-wider mb-3">Quanto tem no caixa?</p>
              <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-onsurface-variant">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={valorInformado}
                  onChange={(e) => setValorInformado(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && valorInformado && setStatus("conferido")}
                  placeholder="0,00"
                  autoFocus
                  className="w-full pl-10 pr-3 py-3 text-xl font-display font-bold text-center rounded-lg border border-surface-high bg-surface focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy transition-colors"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStatus("pendente")}
                  className="flex-1 py-2.5 text-sm text-onsurface-variant hover:text-onsurface border border-surface-high rounded-lg transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setStatus("conferido")}
                  disabled={!valorInformado}
                  className="flex-1 py-2.5 text-sm font-semibold text-white btn-cta rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Conferir
                </button>
              </div>
            </div>
          )}

          {status === "conferido" && (
            <div>
              <div className={`rounded-lg p-5 mb-4 ${bateu ? "bg-success-chip/30" : "bg-red-50 dark:bg-red-900/20"}`}>
                <div className="flex items-center gap-2 mb-4">
                  {bateu ? (
                    <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  <span className={`text-base font-display font-bold ${bateu ? "text-success" : "text-red-600"}`}>
                    {bateu ? "Caixa confere" : "Divergência"}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-onsurface-variant">Fundo de caixa</span>
                    <span className="font-medium">R$ {operator.fundoCaixa.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-onsurface-variant">Vendas em dinheiro</span>
                    <span className="font-medium">R$ {totalDinheiro.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-surface-high/50">
                    <span className="font-semibold">Esperado</span>
                    <span className="font-bold">R$ {esperadoCaixa.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Contado</span>
                    <span className="font-bold">R$ {valorNum.toFixed(2).replace(".", ",")}</span>
                  </div>
                  {!bateu && (
                    <div className="flex justify-between pt-2 border-t border-surface-high/50">
                      <span className={`font-bold ${diferenca > 0 ? "text-success" : "text-red-600"}`}>
                        {diferenca > 0 ? "Sobra" : "Falta"}
                      </span>
                      <span className={`font-bold ${diferenca > 0 ? "text-success" : "text-red-600"}`}>
                        R$ {Math.abs(diferenca).toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => { setStatus("conferindo"); setValorInformado(""); }}
                className="w-full py-2.5 text-sm text-onsurface-variant hover:text-onsurface border border-surface-high rounded-lg transition-colors"
              >
                Recontar
              </button>
            </div>
          )}
        </div>
        </div>
        )}
      </div>
    </div>
  );
}
