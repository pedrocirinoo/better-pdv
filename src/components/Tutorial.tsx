"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";

interface TutorialStep {
  selector: string;
  title: string;
  description: string;
  shortcuts?: string[];
  position: "bottom" | "left" | "top" | "right";
}

const ALL_STEPS: TutorialStep[] = [
  { selector: "[data-tour='scan']", title: "Simular Scan", description: "Simula a leitura de um código de barras. No uso real, o leitor físico adicionaria o produto automaticamente.", shortcuts: ["F3"], position: "top" },
  { selector: "[data-tour='search']", title: "Busca de Produtos", description: "Busque por nome ou código de barras. Clique no produto para adicioná-lo ao carrinho.", position: "left" },
  { selector: "[data-tour='cart']", title: "Carrinho", description: "Lista os itens escaneados. Clique com o botão direito em um item para alterar quantidade, ver preço ou remover.", position: "right" },
  { selector: "[data-tour='total']", title: "Total da Compra", description: "Exibe a quantidade de itens e o valor total atualizado em tempo real.", position: "top" },
  { selector: "[data-tour='finalize']", title: "Finalizar Venda", description: "Abre o modal de pagamento com opções: Pix, Crédito, Débito, Dinheiro e Vale. Para dinheiro, calcula o troco automaticamente.", shortcuts: ["F2"], position: "top" },
  { selector: "[data-tour='supervisor']", title: "Chamar Supervisor", description: "Envia um alerta para o supervisor de turno. Usado para autorizações, estornos ou situações especiais.", shortcuts: ["F1"], position: "bottom" },
  { selector: "[data-tour='historico']", title: "Histórico de Vendas", description: "Abre o painel lateral com todas as vendas do operador atual, filtráveis por dia, mês ou ano.", shortcuts: ["Esc fecha"], position: "bottom" },
  { selector: "[data-tour='fechamento']", title: "Fechamento de Caixa", description: "Resumo diário: total vendido por método, dinheiro esperado no caixa e conferência para verificar se o caixa bateu.", shortcuts: ["F6", "Esc fecha"], position: "bottom" },
  { selector: "[data-tour='produtos']", title: "Gestão de Produtos", description: "Adicione, edite ou remova produtos do catálogo. Alterações refletem imediatamente na busca e no scan.", shortcuts: ["F5", "Esc fecha"], position: "bottom" },
  { selector: "[data-tour='darkmode']", title: "Modo Escuro", description: "Alterna entre tema claro e escuro. Útil para turnos noturnos, reduzindo o cansaço visual do operador.", position: "bottom" },
  { selector: "[data-tour='operator']", title: "Trocar Operador", description: "Selecione outro operador e insira o PIN de 4 dígitos pelo teclado virtual ou físico. Cada operador tem seu próprio histórico.", shortcuts: ["F8", "Esc fecha"], position: "bottom" },
];

interface TutorialProps {
  open: boolean;
  onClose: () => void;
}

export function Tutorial({ open, onClose }: TutorialProps) {
  const [current, setCurrent] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [stepList, setStepList] = useState<TutorialStep[]>([]);
  const rafRef = useRef(0);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipH, setTooltipH] = useState(180);

  // Build visible step list once when opening
  useEffect(() => {
    if (open) {
      const visible = ALL_STEPS.filter(s => document.querySelector(s.selector));
      setStepList(visible);
      setCurrent(0);
      setRect(null);
    }
  }, [open]);

  // Update rect when current step changes
  useEffect(() => {
    if (!open || stepList.length === 0) return;
    const step = stepList[current];
    if (!step) return;

    const measure = () => {
      const el = document.querySelector(step.selector);
      if (el) setRect(el.getBoundingClientRect());
    };

    measure();

    const onResize = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [open, current, stepList]);

  // Keyboard navigation
  useEffect(() => {
    if (!open || stepList.length === 0) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "Enter") {
        setCurrent(c => c < stepList.length - 1 ? c + 1 : (onClose(), c));
      }
      if (e.key === "ArrowLeft") {
        setCurrent(c => c > 0 ? c - 1 : c);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, stepList, onClose]);

  // Measure tooltip height after each render so positioning is always accurate
  useLayoutEffect(() => {
    if (tooltipRef.current) {
      const h = tooltipRef.current.offsetHeight;
      if (h > 0 && h !== tooltipH) setTooltipH(h);
    }
  });

  if (!open || !rect || stepList.length === 0) return null;

  const step = stepList[current];
  const pad = 6;

  const tooltipW = 288;
  const gap = 8;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  // Resolve actual position (with flip using highlight edges)
  let resolvedPos = step.position;
  const hlB = rect.bottom + pad;
  const hlT = rect.top - pad;
  const hlR = rect.right + pad;
  const hlL = rect.left - pad;
  if (resolvedPos === "bottom" && hlB + gap + tooltipH > vh) resolvedPos = "top";
  else if (resolvedPos === "top" && hlT - gap - tooltipH < 0) resolvedPos = "bottom";
  else if (resolvedPos === "right" && hlR + gap + tooltipW > vw) resolvedPos = "left";
  else if (resolvedPos === "left" && hlL - gap - tooltipW < 0) resolvedPos = "right";
  if (resolvedPos === "bottom" && hlB + gap + tooltipH > vh) resolvedPos = "top";
  if (resolvedPos === "top" && hlT - gap - tooltipH < 0) resolvedPos = "bottom";

  // Highlight edges (element rect + pad)
  const hlTop = rect.top - pad;
  const hlBottom = rect.bottom + pad;
  const hlLeft = rect.left - pad;
  const hlRight = rect.right + pad;

  const clampX = (x: number) => Math.max(8, Math.min(x, vw - tooltipW - 8));
  const clampY = (y: number) => Math.max(8, Math.min(y, vh - tooltipH - 8));

  const getTooltipStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = { position: "fixed", zIndex: 60 };

    switch (resolvedPos) {
      case "bottom":
        return { ...base, top: hlBottom + gap, left: clampX(rect.left + rect.width / 2 - tooltipW / 2) };
      case "top":
        return { ...base, top: Math.max(8, hlTop - gap - tooltipH), left: clampX(rect.left + rect.width / 2 - tooltipW / 2) };
      case "left":
        return { ...base, top: clampY(rect.top + rect.height / 2 - tooltipH / 2), left: clampX(hlLeft - gap - tooltipW) };
      case "right":
        return { ...base, top: clampY(rect.top + rect.height / 2 - tooltipH / 2), left: clampX(hlRight + gap) };
    }
  };


  return (
    <>
      {/* Overlay with cutout */}
      <div className="fixed inset-0 z-[55]" onClick={onClose}>
        <svg className="w-full h-full">
          <defs>
            <mask id="tutorial-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={rect.left - pad}
                y={rect.top - pad}
                width={rect.width + pad * 2}
                height={rect.height + pad * 2}
                rx="8"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0" y="0" width="100%" height="100%"
            fill="rgba(0,0,0,0.5)"
            mask="url(#tutorial-mask)"
          />
        </svg>
      </div>

      {/* Highlight border */}
      <div
        className="fixed z-[56] rounded-lg pointer-events-none"
        style={{
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
          boxShadow: "0 0 0 3px var(--color-navy), 0 0 16px rgba(92,107,192,0.3)",
          transition: "all 300ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        onClick={(e) => e.stopPropagation()}
        style={getTooltipStyle()}
        className="z-[57] w-72 bg-surface-lowest rounded-xl shadow-ambient-lg p-4 border border-surface-high"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-bold text-sm">{step.title}</h3>
          <span className="text-xs text-onsurface-variant">{current + 1}/{stepList.length}</span>
        </div>
        <p className="text-xs text-onsurface-variant leading-relaxed mb-3">{step.description}</p>
        {step.shortcuts && step.shortcuts.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <span className="text-[10px] text-onsurface-variant">Atalhos:</span>
            {step.shortcuts.map((s) => (
              <kbd key={s} className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-surface-low border border-surface-high rounded text-onsurface">{s}</kbd>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-onsurface-variant hover:text-onsurface transition-colors"
          >
            Pular tour
          </button>
          <div className="flex gap-2">
            {current > 0 && (
              <button
                onClick={() => setCurrent(c => c - 1)}
                className="px-3 py-1.5 text-xs font-medium border border-surface-high rounded-md hover:bg-surface-low transition-colors"
              >
                Anterior
              </button>
            )}
            <button
              onClick={() => {
                if (current < stepList.length - 1) setCurrent(c => c + 1);
                else onClose();
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white btn-cta rounded-md"
            >
              {current === stepList.length - 1 ? "Concluir" : "Próximo"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
