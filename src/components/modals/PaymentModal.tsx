"use client";

import { useState, useEffect, useRef } from "react";

interface PaymentModalProps {
  open: boolean;
  total: number;
  onConfirm: (method: string) => void;
  onClose: () => void;
}

const methods = [
  { key: "pix", label: "Pix" },
  { key: "credito", label: "Crédito", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
  { key: "debito", label: "Débito", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
  { key: "dinheiro", label: "Dinheiro", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" },
  { key: "vale", label: "Vale", icon: "M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" },
];

function PixIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M11.917 11.71a2.046 2.046 0 0 1-1.454-.602l-2.1-2.1a.4.4 0 0 0-.551 0l-2.108 2.108a2.044 2.044 0 0 1-1.454.602h-.414l2.66 2.66c.83.83 2.177.83 3.007 0l2.667-2.668h-.253zM4.25 4.282c.55 0 1.066.214 1.454.602l2.108 2.108a.39.39 0 0 0 .552 0l2.1-2.1a2.044 2.044 0 0 1 1.453-.602h.253L9.503 1.623a2.127 2.127 0 0 0-3.007 0l-2.66 2.66h.414z" />
      <path d="m14.377 6.496-1.612-1.612a.307.307 0 0 1-.114.023h-.733c-.379 0-.75.154-1.017.422l-2.1 2.1a1.005 1.005 0 0 1-1.425 0L5.268 5.32a1.448 1.448 0 0 0-1.018-.422h-.9a.306.306 0 0 1-.109-.021L1.623 6.496c-.83.83-.83 2.177 0 3.008l1.618 1.618a.305.305 0 0 1 .108-.022h.901c.38 0 .75-.153 1.018-.421L7.375 8.57a1.034 1.034 0 0 1 1.426 0l2.1 2.1c.267.268.638.421 1.017.421h.733c.04 0 .079.01.114.024l1.612-1.612c.83-.83.83-2.178 0-3.008z" />
    </svg>
  );
}

const quickValues = [5, 10, 20, 50, 100, 200];

export function PaymentModal({ open, total, onConfirm, onClose }: PaymentModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [cashStep, setCashStep] = useState(false);
  const [received, setReceived] = useState("");
  const [splitStep, setSplitStep] = useState(false);
  const [splitMethods, setSplitMethods] = useState<[string, string]>(["credito", "dinheiro"]);
  const [splitAmount, setSplitAmount] = useState("");
  const [splitCashStep, setSplitCashStep] = useState(false);
  const [splitCashReceived, setSplitCashReceived] = useState("");

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
      ref.current?.focus();
      setCashStep(false);
      setSplitStep(false);
      setSplitCashStep(false);
      setReceived("");
      setSplitAmount("");
      setSplitCashReceived("");
      setSplitMethods(["credito", "dinheiro"]);
    }
  }, [open]);

  useEffect(() => {
    if (cashStep) inputRef.current?.focus();
  }, [cashStep]);

  const receivedNum = parseFloat(received.replace(",", ".")) || 0;
  const change = receivedNum - total;

  const handleMethodClick = (key: string) => {
    if (key === "dinheiro") {
      setCashStep(true);
    } else {
      onConfirm(key);
    }
  };

  const handleCashConfirm = () => {
    if (receivedNum >= total) {
      onConfirm("dinheiro");
    }
  };

  const handleQuickValue = (value: number) => {
    setReceived(value.toFixed(2).replace(".", ","));
  };

  const handleBack = () => {
    if (splitCashStep) {
      setSplitCashStep(false);
      setSplitCashReceived("");
      return;
    }
    setCashStep(false);
    setSplitStep(false);
    setReceived("");
    setSplitAmount("");
  };

  const splitNum = parseFloat(splitAmount.replace(",", ".")) || 0;
  const splitRemainder = Math.max(0, total - splitNum);
  const splitValid = splitNum > 0 && splitNum < total;

  // Cash portion in split
  const splitCashIndex = splitMethods.indexOf("dinheiro");
  const splitHasCash = splitCashIndex !== -1;
  const splitCashDue = splitCashIndex === 0 ? splitNum : splitRemainder;
  const splitCashReceivedNum = parseFloat(splitCashReceived.replace(",", ".")) || 0;
  const splitCashChange = splitCashReceivedNum - splitCashDue;

  const handleSplitConfirm = () => {
    if (!splitValid) return;
    if (splitHasCash && !splitCashStep) {
      setSplitCashStep(true);
      return;
    }
    if (splitHasCash && splitCashReceivedNum < splitCashDue) return;
    onConfirm(`${splitMethods[0]} + ${splitMethods[1]}`);
  };

  const methodLabels: Record<string, string> = { pix: "Pix", credito: "Crédito", debito: "Débito", dinheiro: "Dinheiro", vale: "Vale" };

  if (!mounted) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm modal-overlay ${open ? "open" : ""}`} onClick={onClose}>
      <div
        ref={ref}
        data-tour="payment-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Pagamento"
        onClick={(e) => e.stopPropagation()}
        className="modal-panel bg-surface-lowest rounded-xl shadow-ambient-lg w-full max-w-md p-6"
      >
        {splitCashStep ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <button onClick={handleBack} className="p-1 rounded-md hover:bg-surface-low transition-colors">
                <svg className="w-5 h-5 text-onsurface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="font-display font-bold text-lg">Troco — Dinheiro</h2>
            </div>

            <div className="text-center mb-5">
              <p className="text-xs text-onsurface-variant mb-1">Parte em dinheiro</p>
              <p className="text-2xl font-display font-bold">R$ {splitCashDue.toFixed(2).replace(".", ",")}</p>
            </div>

            <div className="mb-4">
              <label className="text-xs text-onsurface-variant block mb-1.5">Valor recebido em dinheiro</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-onsurface-variant">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={splitCashReceived}
                  onChange={(e) => setSplitCashReceived(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSplitConfirm()}
                  placeholder="0,00"
                  autoFocus
                  className="w-full pl-10 pr-3 py-3 text-xl font-display font-bold text-center rounded-lg border border-surface-high bg-surface focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5">
              {quickValues.map((v) => (
                <button
                  key={v}
                  onClick={() => setSplitCashReceived(v.toFixed(2).replace(".", ","))}
                  className="py-2 rounded-lg border border-surface-high hover:border-navy hover:bg-navy/5 text-sm font-medium transition-all"
                >
                  R$ {v}
                </button>
              ))}
            </div>

            {splitCashReceivedNum > 0 && (
              <div className={`text-center p-3 rounded-lg mb-4 ${
                splitCashChange >= 0
                  ? "bg-success-chip/20"
                  : "bg-red-50 dark:bg-red-900/20"
              }`}>
                <p className="text-xs text-onsurface-variant mb-0.5">
                  {splitCashChange >= 0 ? "Troco" : "Faltam"}
                </p>
                <p className={`text-xl font-display font-bold ${
                  splitCashChange >= 0 ? "text-success" : "text-red-600"
                }`}>
                  R$ {Math.abs(splitCashChange).toFixed(2).replace(".", ",")}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={handleBack} className="flex-1 py-2.5 text-sm text-onsurface-variant hover:text-onsurface border border-surface-high rounded-lg transition-colors">
                Voltar
              </button>
              <button
                onClick={handleSplitConfirm}
                disabled={splitCashReceivedNum < splitCashDue}
                className="flex-1 py-2.5 text-sm font-semibold text-white btn-cta rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Confirmar
              </button>
            </div>
          </>
        ) : !cashStep && !splitStep ? (
          <>
            <h2 className="font-display font-bold text-lg mb-1">Pagamento</h2>
            <p className="text-sm text-onsurface-variant mb-6">
              Total: <span className="font-display font-bold text-xl text-onsurface">R$ {total.toFixed(2).replace(".", ",")}</span>
            </p>

            <div className="grid grid-cols-3 gap-3">
              {methods.map((m) => (
                <button
                  key={m.key}
                  onClick={() => handleMethodClick(m.key)}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-surface-high hover:border-navy hover:bg-navy/5 transition-all"
                >
                  {m.key === "pix" ? (
                    <PixIcon className="w-6 h-6 text-navy" />
                  ) : (
                    <svg className="w-6 h-6 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={m.icon} />
                    </svg>
                  )}
                  <span className="text-sm font-medium">{m.label}</span>
                </button>
              ))}
            </div>

            <button onClick={() => setSplitStep(true)} className="w-full mt-3 py-2 text-xs text-navy font-medium hover:underline transition-colors">
              Dividir pagamento
            </button>
            <button onClick={onClose} className="w-full py-1.5 text-sm text-onsurface-variant hover:text-onsurface transition-colors">
              Cancelar
            </button>
          </>
        ) : splitStep ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <button onClick={handleBack} className="p-1 rounded-md hover:bg-surface-low transition-colors">
                <svg className="w-5 h-5 text-onsurface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="font-display font-bold text-lg">Dividir Pagamento</h2>
            </div>

            <div className="text-center mb-4">
              <p className="text-xs text-onsurface-variant mb-1">Total</p>
              <p className="text-2xl font-display font-bold">R$ {total.toFixed(2).replace(".", ",")}</p>
            </div>

            {/* Method selectors */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[0, 1].map((idx) => (
                <div key={idx}>
                  <p className="text-[10px] text-onsurface-variant mb-1.5">{idx === 0 ? "1° método" : "2° método"}</p>
                  <select
                    value={splitMethods[idx]}
                    onChange={(e) => {
                      const next = [...splitMethods] as [string, string];
                      next[idx] = e.target.value;
                      setSplitMethods(next);
                    }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-surface-high bg-surface focus:outline-none focus:ring-2 focus:ring-navy/30"
                  >
                    {methods.map(m => (
                      <option key={m.key} value={m.key}>{m.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Amount for first method */}
            <div className="mb-3">
              <label className="text-xs text-onsurface-variant block mb-1.5">Valor no {methodLabels[splitMethods[0]]}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-onsurface-variant">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={splitAmount}
                  onChange={(e) => setSplitAmount(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSplitConfirm()}
                  placeholder="0,00"
                  autoFocus
                  className="w-full pl-10 pr-3 py-2.5 text-lg font-display font-bold text-center rounded-lg border border-surface-high bg-surface focus:outline-none focus:ring-2 focus:ring-navy/30 transition-colors"
                />
              </div>
            </div>

            {/* 50/50 button */}
            <button
              onClick={() => setSplitAmount((total / 2).toFixed(2).replace(".", ","))}
              className="w-full py-1.5 mb-4 text-xs font-medium text-navy hover:underline"
            >
              Dividir 50/50
            </button>

            {/* Remainder preview */}
            {splitNum > 0 && (
              <div className="rounded-lg border border-surface-high p-3 mb-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-onsurface-variant">{methodLabels[splitMethods[0]]}</span>
                  <span className="font-semibold">R$ {splitNum.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-onsurface-variant">{methodLabels[splitMethods[1]]}</span>
                  <span className="font-semibold">R$ {splitRemainder.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={handleBack} className="flex-1 py-2.5 text-sm text-onsurface-variant hover:text-onsurface border border-surface-high rounded-lg transition-colors">
                Voltar
              </button>
              <button
                onClick={handleSplitConfirm}
                disabled={!splitValid}
                className="flex-1 py-2.5 text-sm font-semibold text-white btn-cta rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Confirmar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <button onClick={handleBack} className="p-1 rounded-md hover:bg-surface-low transition-colors">
                <svg className="w-5 h-5 text-onsurface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="font-display font-bold text-lg">Pagamento em Dinheiro</h2>
            </div>

            <div className="text-center mb-5">
              <p className="text-xs text-onsurface-variant mb-1">Total da compra</p>
              <p className="text-2xl font-display font-bold">R$ {total.toFixed(2).replace(".", ",")}</p>
            </div>

            <div className="mb-4">
              <label className="text-xs text-onsurface-variant block mb-1.5">Valor recebido</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-onsurface-variant">R$</span>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="decimal"
                  value={received}
                  onChange={(e) => setReceived(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCashConfirm()}
                  placeholder="0,00"
                  className="w-full pl-10 pr-3 py-3 text-xl font-display font-bold text-center rounded-lg border border-surface-high bg-surface focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5">
              {quickValues.map((v) => (
                <button
                  key={v}
                  onClick={() => handleQuickValue(v)}
                  className="py-2 rounded-lg border border-surface-high hover:border-navy hover:bg-navy/5 text-sm font-medium transition-all"
                >
                  R$ {v}
                </button>
              ))}
            </div>

            {receivedNum > 0 && (
              <div className={`text-center p-3 rounded-lg mb-4 ${
                change >= 0
                  ? "bg-success-chip/20"
                  : "bg-red-50 dark:bg-red-900/20"
              }`}>
                <p className="text-xs text-onsurface-variant mb-0.5">
                  {change >= 0 ? "Troco" : "Faltam"}
                </p>
                <p className={`text-xl font-display font-bold ${
                  change >= 0 ? "text-success" : "text-red-600"
                }`}>
                  R$ {Math.abs(change).toFixed(2).replace(".", ",")}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={handleBack} className="flex-1 py-2.5 text-sm text-onsurface-variant hover:text-onsurface border border-surface-high rounded-lg transition-colors">
                Voltar
              </button>
              <button
                onClick={handleCashConfirm}
                disabled={receivedNum < total}
                className="flex-1 py-2.5 text-sm font-semibold text-white btn-cta rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Confirmar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
