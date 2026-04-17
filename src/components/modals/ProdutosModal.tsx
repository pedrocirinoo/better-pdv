"use client";

import { useState, useEffect, useCallback } from "react";
import { Product } from "@/lib/types";

interface ProdutosModalProps {
  open: boolean;
  products: Product[];
  onSave: (products: Product[]) => void;
  onClose: () => void;
}

export function ProdutosModal({ open, products, onSave, onClose }: ProdutosModalProps) {
  const [mounted, setMounted] = useState(false);
  const [list, setList] = useState<Product[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", price: "", unit: "un" as "un" | "kg" });
  const [search, setSearch] = useState("");

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
      setList([...products]);
      setEditing(null);
      setAdding(false);
      setForm({ code: "", name: "", price: "", unit: "un" });
      setSearch("");
    }
  }, [open, products]);

  const startEdit = useCallback((p: Product) => {
    setEditing(p.code);
    setForm({ code: p.code, name: p.name, price: p.price.toFixed(2).replace(".", ","), unit: p.unit ?? "un" });
    setAdding(false);
  }, []);

  const startAdd = useCallback(() => {
    setAdding(true);
    setEditing(null);
    setForm({ code: "", name: "", price: "", unit: "un" });
  }, []);

  const saveEdit = useCallback(() => {
    const price = parseFloat(form.price.replace(",", ".")) || 0;
    if (!form.code.trim() || !form.name.trim() || price <= 0) return;

    if (adding) {
      if (list.some(p => p.code === form.code.trim())) return;
      setList(prev => [...prev, { code: form.code.trim(), name: form.name.trim(), price, unit: form.unit }]);
    } else if (editing) {
      setList(prev => prev.map(p => p.code === editing ? { code: form.code.trim(), name: form.name.trim(), price, unit: form.unit } : p));
    }
    setEditing(null);
    setAdding(false);
    setForm({ code: "", name: "", price: "", unit: "un" });
  }, [form, editing, adding, list]);

  const removeProduct = useCallback((code: string) => {
    setList(prev => prev.filter(p => p.code !== code));
    if (editing === code) {
      setEditing(null);
      setForm({ code: "", name: "", price: "", unit: "un" });
    }
  }, [editing]);

  const handleConfirm = useCallback(() => {
    onSave(list);
    onClose();
  }, [list, onSave, onClose]);

  const filtered = search.trim()
    ? list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.code.includes(search))
    : list;

  const hasChanges = JSON.stringify(list) !== JSON.stringify(products);

  if (!mounted) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center modal-overlay ${open ? "open" : ""}`} onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-panel relative w-full max-w-lg bg-surface-lowest rounded-xl shadow-ambient-lg flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="shrink-0 px-5 pt-5 pb-4 border-b border-surface-high">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">Produtos</h2>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-surface-low transition-colors text-onsurface-variant">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-onsurface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-surface-high bg-surface focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy transition-colors"
              />
            </div>
            <button
              onClick={startAdd}
              className="px-4 py-2 text-sm font-semibold text-white btn-cta rounded-lg flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Novo
            </button>
          </div>
        </div>

        {/* Add/Edit form */}
        {(adding || editing) && (
          <div className="shrink-0 px-5 py-4 border-b border-surface-high bg-surface-low/50">
            <p className="text-xs font-semibold text-onsurface-variant uppercase tracking-wider mb-3">
              {adding ? "Novo produto" : "Editar produto"}
            </p>
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_5rem_4rem] gap-2 mb-3">
              <div className="relative min-w-0">
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="Código"
                  readOnly={!!editing}
                  className={`min-w-0 w-full pl-3 pr-8 py-2 text-sm rounded-lg border border-surface-high bg-surface focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy transition-colors ${editing ? "opacity-50" : ""}`}
                />
                {adding && (
                  <button
                    type="button"
                    onClick={() => {
                      const fake = String(7890000000000 + Math.floor(Math.random() * 999999999));
                      setForm(f => ({ ...f, code: fake }));
                    }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-surface-low transition-colors text-onsurface-variant hover:text-navy"
                    title="Escanear código de barras"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75H16.5v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75H16.5v-.75z" />
                    </svg>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Nome do produto"
                autoFocus
                className="min-w-0 px-3 py-2 text-sm rounded-lg border border-surface-high bg-surface focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy transition-colors"
              />
              <input
                type="text"
                inputMode="decimal"
                value={form.price}
                onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="0,00"
                maxLength={6}
                className="min-w-0 px-2 py-2 text-sm rounded-lg border border-surface-high bg-surface focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy transition-colors"
              />
              <div className="flex rounded-lg border border-surface-high overflow-hidden text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, unit: "un" }))}
                  className={`flex-1 py-2 transition-colors ${form.unit === "un" ? "bg-navy text-white" : "bg-surface text-onsurface-variant hover:bg-surface-low"}`}
                >
                  un
                </button>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, unit: "kg" }))}
                  className={`flex-1 py-2 transition-colors ${form.unit === "kg" ? "bg-navy text-white" : "bg-surface text-onsurface-variant hover:bg-surface-low"}`}
                >
                  kg
                </button>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setAdding(false); setEditing(null); setForm({ code: "", name: "", price: "", unit: "un" }); }}
                className="px-4 py-1.5 text-sm text-onsurface-variant hover:text-onsurface border border-surface-high rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveEdit}
                disabled={!form.code.trim() || !form.name.trim() || !(parseFloat(form.price.replace(",", ".")) > 0)}
                className="px-4 py-1.5 text-sm font-semibold text-white btn-cta rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {adding ? "Adicionar" : "Salvar"}
              </button>
            </div>
          </div>
        )}

        {/* Product list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-onsurface-variant text-center py-12">Nenhum produto encontrado</p>
          ) : (
            <div className="divide-y divide-surface-high/50">
              {filtered.map((p) => (
                <div
                  key={p.code}
                  className={`flex items-center justify-between px-5 py-3 hover:bg-surface-low/50 transition-colors ${editing === p.code ? "bg-surface-low" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-onsurface-variant">{p.code}</span>
                      <span className="text-xs font-semibold text-navy">R$ {p.price.toFixed(2).replace(".", ",")}{p.unit === "kg" ? "/kg" : ""}</span>
                      {p.unit === "kg" && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">balança</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <button
                      onClick={() => startEdit(p)}
                      className="p-1.5 rounded-md hover:bg-surface-low transition-colors text-onsurface-variant hover:text-onsurface"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeProduct(p.code)}
                      className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-onsurface-variant hover:text-red-600"
                      title="Remover"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-4 border-t border-surface-high flex items-center justify-between">
          <span className="text-xs text-onsurface-variant">{list.length} produtos</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-onsurface-variant hover:text-onsurface border border-surface-high rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!hasChanges}
              className="px-5 py-2 text-sm font-semibold text-white btn-cta rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Salvar alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
