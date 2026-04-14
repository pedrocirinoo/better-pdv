"use client";

import { useState, useEffect, useRef } from "react";
import { Product } from "@/lib/types";

interface WeightModalProps {
  open: boolean;
  product: Product | null;
  onConfirm: (weight: number) => void;
  onClose: () => void;
}

export function WeightModal({ open, product, onConfirm, onClose }: WeightModalProps) {
  const [mounted, setMounted] = useState(false);
  const [weight, setWeight] = useState(0);
  const [settled, setSettled] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetRef = useRef(0);

  useEffect(() => {
    if (open) {
      setMounted(true);
    } else {
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (open && product) {
      setSettled(false);
      setWeight(0);

      const target = Math.round((0.2 + Math.random() * 2.3) * 1000) / 1000;
      targetRef.current = target;

      const steps = 20 + Math.floor(Math.random() * 15);
      let step = 0;

      intervalRef.current = setInterval(() => {
        step++;
        if (step >= steps) {
          setWeight(target);
          setSettled(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }
        const progress = step / steps;
        const eased = 1 - Math.pow(1 - progress, 3);
        const jitter = (1 - progress) * (Math.random() - 0.5) * 0.15;
        setWeight(Math.max(0, target * eased + jitter));
      }, 60);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, product]);

  if (!mounted) return null;
  if (!product) return null;

  const total = weight * product.price;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm modal-overlay ${open ? "open" : ""}`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-panel bg-surface-lowest rounded-xl shadow-ambient-lg w-full max-w-xs p-6"
      >
        <h2 className="font-display font-bold text-lg mb-1">Balanca</h2>
        <p className="text-sm text-onsurface-variant mb-1 truncate">{product.name}</p>
        <p className="text-xs text-onsurface-variant mb-6">
          R$ {product.price.toFixed(2)} / kg
        </p>

        <div className="flex flex-col items-center mb-6">
          <span className="text-5xl font-display font-bold tabular-nums tracking-tight">
            {weight.toFixed(3)}
          </span>
          <span className="text-sm text-onsurface-variant mt-1">kg</span>
        </div>

        <div className="text-center mb-6">
          <span className="text-sm text-onsurface-variant">Total: </span>
          <span className="font-display font-bold text-lg">
            R$ {total.toFixed(2)}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm text-onsurface-variant hover:text-onsurface border border-surface-high rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(parseFloat(weight.toFixed(3)))}
            disabled={!settled}
            className="flex-1 py-2 text-sm font-semibold text-white btn-cta rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar Peso
          </button>
        </div>
      </div>
    </div>
  );
}
