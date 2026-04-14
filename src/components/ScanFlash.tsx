"use client";

interface ScanFlashProps {
  type: "ok" | "err" | null;
}

export function ScanFlash({ type }: ScanFlashProps) {
  if (!type) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-40 transition-opacity duration-300 ${
        type === "ok"
          ? "bg-success/10 border-2 border-success/30"
          : "bg-red-500/10 border-2 border-red-500/30"
      }`}
      style={{ animation: "flash 1.2s ease-out forwards" }}
    >
      <style>{`
        @keyframes flash {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
