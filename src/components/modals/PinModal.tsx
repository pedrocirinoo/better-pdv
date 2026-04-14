"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Operator } from "@/lib/types";

interface PinModalProps {
  open: boolean;
  target: Operator | null;
  onSuccess: () => void;
  onClose: () => void;
}

export function PinModal({ open, target, onSuccess, onClose }: PinModalProps) {
  const [mounted, setMounted] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const pinRef = useRef(pin);
  pinRef.current = pin;

  useEffect(() => {
    if (open) {
      setMounted(true);
    } else {
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (open) { setPin(""); setError(false); }
  }, [open]);

  const processDigit = useCallback((d: string) => {
    if (!target) return;
    if (pinRef.current.length >= 4) return;
    const next = pinRef.current + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      if (next === target.pin) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => { setPin(""); setError(false); }, 600);
      }
    }
  }, [target, onSuccess]);

  const processDelete = useCallback(() => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  }, []);

  useEffect(() => {
    if (!open || !target) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        processDigit(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        processDelete();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, target, processDigit, processDelete, onClose]);

  if (!mounted) return null;
  if (!target) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm modal-overlay ${open ? "open" : ""}`} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="modal-panel bg-surface-lowest rounded-xl shadow-ambient-lg w-full max-w-xs p-6">
        <h2 className="font-display font-bold text-lg mb-1 text-center">PIN do Operador</h2>
        <p className="text-sm text-onsurface-variant text-center mb-6">{target.name}</p>

        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                error ? "bg-red-500" : i < pin.length ? "bg-navy" : "bg-surface-high"
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {["1","2","3","4","5","6","7","8","9","","0","←"].map((d) =>
            d === "" ? <div key="empty" /> : (
              <button
                key={d}
                onClick={() => d === "←" ? processDelete() : processDigit(d)}
                className="py-3 rounded-lg text-lg font-medium hover:bg-surface-low transition-colors"
              >
                {d}
              </button>
            )
          )}
        </div>

        <button onClick={onClose} className="w-full mt-4 py-2 text-sm text-onsurface-variant hover:text-onsurface transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  );
}
