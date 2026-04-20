"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";

export interface TutorialStep {
  selector: string;
  title: string;
  description: string;
  shortcuts?: string[];
  position: "bottom" | "left" | "top" | "right";
  onEnter?: () => void;
  onLeave?: () => void;
}

interface TutorialProps {
  open: boolean;
  steps: TutorialStep[];
  onClose: () => void;
}

export function Tutorial({ open, steps, onClose }: TutorialProps) {
  const [current, setCurrent] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [stepList, setStepList] = useState<TutorialStep[]>([]);
  const rafRef = useRef(0);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipH, setTooltipH] = useState(180);
  const prevIndexRef = useRef<number>(-1);

  // Build step list once when opening (no DOM filtering — onEnter creates elements before measure)
  useEffect(() => {
    if (open) {
      setStepList(steps);
      setCurrent(0);
      setRect(null);
      prevIndexRef.current = -1;
    } else {
      // On close, call onLeave for current step
      setStepList(prev => {
        prev[prevIndexRef.current]?.onLeave?.();
        return prev;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Fire onLeave → onEnter when step changes
  useEffect(() => {
    if (!open || stepList.length === 0) return;
    const prev = prevIndexRef.current;
    if (prev >= 0 && prev !== current) stepList[prev]?.onLeave?.();
    stepList[current]?.onEnter?.();
    prevIndexRef.current = current;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, stepList, open]);

  // Update rect when current step changes (with small delay so onEnter can mutate DOM)
  useEffect(() => {
    if (!open || stepList.length === 0) return;
    const step = stepList[current];
    if (!step) return;

    const measure = () => {
      const el = document.querySelector(step.selector);
      if (el) setRect(el.getBoundingClientRect());
    };

    // Quick pass for already-visible elements (buttons, static panels)
    const t1 = setTimeout(measure, 50);
    // Second pass after CSS transitions settle (modals: 250ms, drawers: 300ms)
    const t2 = setTimeout(measure, 320);

    const onResize = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };

    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
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
  const pad = 3;
  const tooltipW = 288;
  const gap = 8;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

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

  const hlTop = rect.top - pad;
  const hlBottom = rect.bottom + pad;
  const hlLeft = rect.left - pad;
  const hlRight = rect.right + pad;

  const clampX = (x: number) => Math.max(8, Math.min(x, vw - tooltipW - 8));
  const clampY = (y: number) => Math.max(8, Math.min(y, vh - tooltipH - 8));

  const getTooltipStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = { position: "fixed", zIndex: 60 };
    switch (resolvedPos) {
      case "bottom": return { ...base, top: hlBottom + gap, left: clampX(rect.left + rect.width / 2 - tooltipW / 2) };
      case "top":    return { ...base, top: Math.max(8, hlTop - gap - tooltipH), left: clampX(rect.left + rect.width / 2 - tooltipW / 2) };
      case "left":   return { ...base, top: clampY(rect.top + rect.height / 2 - tooltipH / 2), left: clampX(hlLeft - gap - tooltipW) };
      case "right":  return { ...base, top: clampY(rect.top + rect.height / 2 - tooltipH / 2), left: clampX(hlRight + gap) };
    }
  };

  return (
    <>
      {/* Dark overlay — below modals (z-50) so demos show on top */}
      <div className="fixed inset-0 z-40 bg-black/40" />

      {/* Highlight border */}
      <div
        className="fixed z-[55] rounded-lg pointer-events-none"
        style={{
          top: rect.top - pad, left: rect.left - pad,
          width: rect.width + pad * 2, height: rect.height + pad * 2,
          boxShadow: "0 0 0 2px var(--color-navy), 0 0 0 4px rgba(92,107,192,0.25)",
          transition: "all 300ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={getTooltipStyle()}
        className="z-[56] w-72 bg-surface-lowest rounded-xl shadow-ambient-lg p-4 border border-surface-high"
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
          <button onClick={onClose} className="text-xs text-onsurface-variant hover:text-onsurface transition-colors">
            Pular tour
          </button>
          <div className="flex gap-2">
            {current > 0 && (
              <button onClick={() => setCurrent(c => c - 1)} className="px-3 py-1.5 text-xs font-medium border border-surface-high rounded-md hover:bg-surface-low transition-colors">
                Anterior
              </button>
            )}
            <button
              onClick={() => { if (current < stepList.length - 1) setCurrent(c => c + 1); else onClose(); }}
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
