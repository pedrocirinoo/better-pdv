"use client";

interface FooterProps {
  total: number;
  subtotal?: number;
  discount?: number;
  itemCount: number;
  onSimulateScan: () => void;
  onFinalize: () => void;
  onCancelSale: () => void;
  onDiscount: () => void;
}

export function Footer({ total, subtotal, discount, itemCount, onSimulateScan, onFinalize, onCancelSale, onDiscount }: FooterProps) {
  return (
    <footer className="glass border-t border-surface-high px-3 md:px-6 py-3 flex items-center shrink-0">
      <div className="mr-4 md:mr-8" data-tour="total">
        <p className="text-xs text-onsurface-variant">{itemCount} {itemCount === 1 ? "item" : "itens"}</p>
        {discount && subtotal ? (
          <>
            <p className="text-xs text-onsurface-variant line-through">R$ {subtotal.toFixed(2).replace(".", ",")}</p>
            <p className="text-3xl font-display font-bold tracking-tight text-success">
              R$ {total.toFixed(2).replace(".", ",")}
            </p>
            <p className="text-[10px] text-navy font-medium">-R$ {discount.toFixed(2).replace(".", ",")} desconto</p>
          </>
        ) : (
          <p className="text-3xl font-display font-bold tracking-tight">
            R$ {total.toFixed(2).replace(".", ",")}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        <button
          onClick={onSimulateScan}
          data-tour="scan"
          aria-label="Simular scan de produto"
          className="flex items-center gap-2 px-4 py-2 rounded-md border border-surface-high hover:bg-surface-low text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <span className="hidden md:inline">Simular Scan</span> <span className="text-xs opacity-50 ml-1 hidden sm:inline">F3</span>
        </button>

        <div className={`grid transition-all duration-300 ease-in-out ${itemCount > 0 ? "grid-cols-[1fr] opacity-100" : "grid-cols-[0fr] opacity-0"}`}>
          <div className="overflow-hidden flex gap-3">
            <button
              onClick={onDiscount}
              disabled={itemCount === 0}
              data-tour="discount"
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-navy text-navy hover:bg-navy/5 transition-colors active:scale-[0.98] whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span className="hidden md:inline">Desconto</span>
            </button>

            <button
              onClick={onCancelSale}
              disabled={itemCount === 0}
              data-tour="cancel"
              className="flex items-center gap-2 px-4 md:px-8 py-2 rounded-md text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors active:scale-[0.98] whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden md:inline">Cancelar</span> <span className="text-xs opacity-70 ml-1 hidden sm:inline">F4</span>
            </button>
          </div>
        </div>

        <button
          onClick={onFinalize}
          data-tour="finalize"
          className="btn-cta text-white font-semibold px-4 md:px-8 py-2 rounded-md text-sm transition-all active:scale-[0.98]"
        >
          <span className="hidden md:inline">Finalizar</span> <span className="text-xs opacity-70 ml-1 hidden sm:inline">F2</span>
        </button>
      </div>
    </footer>
  );
}
