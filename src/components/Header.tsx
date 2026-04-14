"use client";

import { Operator } from "@/lib/types";

interface HeaderProps {
  operator: Operator;
  onOperatorClick: () => void;
  dark: boolean;
  onToggleDark: () => void;
  onHistorico: () => void;
  onFechamento: () => void;
  onProdutos: () => void;
  onCallSupervisor: () => void;
  onTutorial: () => void;
}

export function Header({ operator, onOperatorClick, dark, onToggleDark, onHistorico, onFechamento, onProdutos, onCallSupervisor, onTutorial }: HeaderProps) {
  const now = new Date();
  const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });

  return (
    <header className="glass border-b border-surface-high px-3 md:px-6 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success scanner-pulse" />
          <span className="font-display font-bold text-navy text-lg tracking-tight">PDV</span>
        </div>
        <span className="text-xs text-onsurface-variant hidden sm:inline">{date} — {time}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onCallSupervisor}
          data-tour="supervisor"
          className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-all duration-150 hover:scale-110 active:scale-95"
          title="Chamar supervisor (F1)"
          aria-label="Chamar supervisor"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </button>

        <button
          onClick={onHistorico}
          data-tour="historico"
          className="p-2 rounded-md hover:bg-surface-low transition-all duration-150 text-onsurface-variant hover:text-onsurface hover:scale-110 active:scale-95"
          title="Histórico"
          aria-label="Histórico de vendas"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <button
          onClick={onFechamento}
          data-tour="fechamento"
          className="p-2 rounded-md hover:bg-surface-low transition-all duration-150 text-onsurface-variant hover:text-onsurface hover:scale-110 active:scale-95"
          title="Fechamento de caixa (F6)"
          aria-label="Fechamento de caixa"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
        </button>

        <button
          onClick={onProdutos}
          data-tour="produtos"
          className="p-2 rounded-md hover:bg-surface-low transition-all duration-150 text-onsurface-variant hover:text-onsurface hover:scale-110 active:scale-95"
          title="Produtos (F5)"
          aria-label="Gerenciar produtos"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </button>

        <button
          onClick={onToggleDark}
          data-tour="darkmode"
          className="p-2 rounded-md hover:bg-surface-low transition-all duration-150 text-onsurface-variant hover:text-onsurface hover:scale-110 active:scale-95"
          title={dark ? "Modo claro" : "Modo escuro"}
        >
          {dark ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <button
          onClick={onTutorial}
          className="p-2 rounded-md hover:bg-surface-low transition-all duration-150 text-onsurface-variant hover:text-onsurface hover:scale-110 active:scale-95"
          title="Tutorial"
          aria-label="Abrir tutorial"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        </button>

        <div className="w-px h-6 bg-surface-high mx-1" />

        <button
          onClick={onOperatorClick}
          data-tour="operator"
          className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-surface-low transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center">
            <span className="text-white text-xs font-semibold">{operator.initials}</span>
          </div>
          <span className="text-sm font-medium hidden sm:inline">{operator.name}</span>
          <svg className="w-3.5 h-3.5 text-onsurface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </header>
  );
}
