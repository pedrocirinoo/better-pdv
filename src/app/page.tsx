"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { CartItem, Operator, Product, Purchase } from "@/lib/types";
import { PRODUCTS, INITIAL_OPERATORS } from "@/lib/data";
import { Header } from "@/components/Header";
import { ItemList } from "@/components/ItemList";
import { SearchPanel } from "@/components/SearchPanel";
import { Footer } from "@/components/Footer";
import { ContextMenu } from "@/components/ContextMenu";
import { PaymentModal } from "@/components/modals/PaymentModal";
import { PinModal } from "@/components/modals/PinModal";
import { OperatorModal } from "@/components/modals/OperatorModal";
import { QtyModal } from "@/components/modals/QtyModal";
import { OperatorPanelModal } from "@/components/modals/OperatorPanelModal";
import { FechamentoDrawer } from "@/components/modals/FechamentoDrawer";
import { ProdutosModal } from "@/components/modals/ProdutosModal";
import { ReceiptModal } from "@/components/modals/ReceiptModal";
import { DiscountModal } from "@/components/modals/DiscountModal";
import { ItemDiscountModal } from "@/components/modals/ItemDiscountModal";
import { WeightModal } from "@/components/modals/WeightModal";
import { Toast } from "@/components/Toast";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { ScanFlash } from "@/components/ScanFlash";
import { Tutorial, TutorialStep } from "@/components/Tutorial";
import { beepScan, chimeSuccess, buzzError } from "@/lib/sounds";

export default function PDV() {
  const [dark, setDark] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [operators, setOperators] = useState<Operator[]>(INITIAL_OPERATORS.map(o => ({...o, history: []})));
  const [currentOperator, setCurrentOperator] = useState<Operator>(operators[0]);
  const [scanIndex, setScanIndex] = useState(0);

  // Modal states
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [operatorOpen, setOperatorOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [pinTarget, setPinTarget] = useState<Operator | null>(null);
  const [qtyOpen, setQtyOpen] = useState(false);
  const [qtyItem, setQtyItem] = useState<CartItem | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelOperator, setPanelOperator] = useState<Operator | null>(null);
  const [fechamentoOpen, setFechamentoOpen] = useState(false);
  const [produtosOpen, setProdutosOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<{ itemCount: number; total: number; method: string; saleNumber: number } | null>(null);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [weightOpen, setWeightOpen] = useState(false);
  const [weightProduct, setWeightProduct] = useState<Product | null>(null);
  const [itemDiscountOpen, setItemDiscountOpen] = useState(false);
  const [itemDiscountTarget, setItemDiscountTarget] = useState<CartItem | null>(null);

  // Context menu
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId: number } | null>(null);

  // Toast & scan flash
  const [toast, setToast] = useState<string | null>(null);
  const [scanFlash, setScanFlash] = useState<"ok" | "err" | null>(null);
  const toastTimer = useRef<NodeJS.Timeout>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }, []);

  const flashScan = useCallback((type: "ok" | "err") => {
    setScanFlash(type);
    setTimeout(() => setScanFlash(null), 1200);
  }, []);

  // Add item
  const addItem = useCallback((product: Product) => {
    if (product.unit === "kg") {
      setWeightProduct(product);
      setWeightOpen(true);
      return;
    }
    setItems(prev => {
      const existing = prev.find(i => i.code === product.code);
      if (existing) return prev.map(i => i.code === product.code ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1, id: Date.now() }];
    });
    flashScan("ok");
    beepScan();
    showToast(`✓ ${product.name}`);
  }, [flashScan, showToast]);

  // Weight confirm
  const handleWeightConfirm = useCallback((weight: number) => {
    if (!weightProduct) return;
    setItems(prev => [...prev, { ...weightProduct, qty: 1, weight, price: Math.round(weightProduct.price * weight * 100) / 100, id: Date.now() }]);
    flashScan("ok");
    beepScan();
    showToast(`✓ ${weightProduct.name} — ${weight.toFixed(3)}kg`);
    setWeightOpen(false);
    setWeightProduct(null);
  }, [weightProduct, flashScan, showToast]);

  // Simulate scan
  const simulateScan = useCallback(() => {
    const product = products[scanIndex % products.length];
    setScanIndex(prev => prev + 1);
    addItem(product);
  }, [scanIndex, products, addItem]);

  // Context actions
  const handleContextAction = useCallback((action: string) => {
    if (!contextMenu) return;
    const item = items.find(i => i.id === contextMenu.itemId);
    if (!item) return;

    if (action === "remove") {
      setItems(prev => prev.filter(i => i.id !== contextMenu.itemId));
      showToast(`Removido: ${item.name}`);
    }
    if (action === "price") {
      showToast(`${item.name} — R$ ${item.price.toFixed(2).replace(".", ",")} /un`);
    }
    if (action === "qty") {
      setQtyItem(item);
      setQtyOpen(true);
    }
    if (action === "discount") {
      setItemDiscountTarget(item);
      setItemDiscountOpen(true);
    }
    setContextMenu(null);
  }, [contextMenu, items, showToast]);

  // Qty confirm
  const handleQtyConfirm = useCallback((newQty: number) => {
    if (!qtyItem) return;
    if (newQty === 0) {
      setItems(prev => prev.filter(i => i.id !== qtyItem.id));
    } else {
      setItems(prev => prev.map(i => i.id === qtyItem.id ? { ...i, qty: newQty } : i));
    }
    setQtyOpen(false);
    setQtyItem(null);
  }, [qtyItem]);

  // Operator select
  const handleSelectOperator = useCallback((op: Operator) => {
    if (op.id === currentOperator.id) { setOperatorOpen(false); return; }
    setPinTarget(op);
    setOperatorOpen(false);
    setPinOpen(true);
  }, [currentOperator]);

  // Pin success
  const handlePinSuccess = useCallback(() => {
    if (!pinTarget) return;
    setCurrentOperator(pinTarget);
    setPinOpen(false);
    setPinTarget(null);
    showToast(`✓ Operador: ${pinTarget.name}`);
  }, [pinTarget, showToast]);

  // Item-level discount
  const handleItemDiscount = useCallback((itemId: number, pct: number) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, itemDiscount: pct || undefined } : i));
    setItemDiscountOpen(false);
    setItemDiscountTarget(null);
    if (pct > 0) showToast(`Desconto de ${pct}% aplicado`);
    else showToast("Desconto removido");
  }, [showToast]);

  // Discount
  const handleApplyDiscount = useCallback((discountValue: number) => {
    setDiscount(discountValue);
    setDiscountOpen(false);
    showToast(`Desconto de R$ ${discountValue.toFixed(2).replace(".", ",")} aplicado`);
  }, [showToast]);

  // Refund
  const handleRefund = useCallback((purchaseIndex: number, amount: number) => {
    const mark = (p: Purchase, i: number) =>
      i === purchaseIndex ? { ...p, refunded: true, refundedAmount: amount } : p;
    setOperators(prev => prev.map(op =>
      op.id === currentOperator.id ? { ...op, history: op.history.map(mark) } : op
    ));
    setCurrentOperator(prev => ({ ...prev, history: prev.history.map(mark) }));
    setPanelOperator(prev => prev ? { ...prev, history: prev.history.map(mark) } : null);
    buzzError();
    showToast(`Estorno de R$ ${amount.toFixed(2).replace(".", ",")} autorizado`);
  }, [currentOperator, showToast]);

  // Payment confirm
  const handlePaymentConfirm = useCallback((method: string) => {
    const subtotal = items.reduce((s, i) => {
      const lineTotal = i.price * i.qty;
      return s + (i.itemDiscount ? lineTotal * (1 - i.itemDiscount / 100) : lineTotal);
    }, 0);
    const finalTotal = Math.max(0, subtotal - discount);
    const count = items.reduce((s, i) => s + i.qty, 0);
    const now = new Date();
    const purchase = {
      date: now.toISOString(),
      time: now.toLocaleTimeString("pt-BR"),
      total: finalTotal,
      itemCount: count,
      paymentMethod: method,
      discount: discount > 0 ? discount : undefined,
    };
    setOperators(prev => prev.map(op =>
      op.id === currentOperator.id ? { ...op, history: [...op.history, purchase] } : op
    ));
    setCurrentOperator(prev => ({ ...prev, history: [...prev.history, purchase] }));

    // Save receipt data before clearing
    setReceiptData({ itemCount: count, total: finalTotal, method, saleNumber: currentOperator.history.length + 1 });
    setItems([]);
    setScanIndex(0);
    setDiscount(0);
    setPaymentOpen(false);
    setReceiptOpen(true);
    chimeSuccess();
  }, [items, currentOperator, discount]);

  // Close tutorial and reset PDV to clean state
  const handleCloseTutorial = useCallback(() => {
    setTutorialOpen(false);
    setContextMenu(null);
    setDiscountOpen(false);
    setPaymentOpen(false);
    setQtyOpen(false); setQtyItem(null);
    setItemDiscountOpen(false); setItemDiscountTarget(null);
    setPanelOpen(false);
    setFechamentoOpen(false);
    setProdutosOpen(false);
    setOperatorOpen(false);
    setItems([]);
    setScanIndex(0);
    setDiscount(0);
  }, []);

  // Pre-scan items when tutorial opens so footer is stable before first step measures
  const handleOpenTutorial = useCallback(() => {
    if (items.length === 0) {
      simulateScan();
      setTimeout(simulateScan, 250);
      setTimeout(simulateScan, 500);
      setTimeout(() => setTutorialOpen(true), 700);
    } else {
      setTutorialOpen(true);
    }
  }, [items.length, simulateScan]);

  const toggleDark = useCallback(() => {
    setDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Skip if any modal/drawer is open or if typing in an input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      // Receipt: close with Escape, Enter or Space
      if (receiptOpen && (e.key === "Escape" || e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        setReceiptOpen(false);
        return;
      }

      // Escape closes the topmost open modal/drawer
      if (e.key === "Escape") {
        e.preventDefault();
        if (itemDiscountOpen) { setItemDiscountOpen(false); setItemDiscountTarget(null); return; }
        if (weightOpen) { setWeightOpen(false); setWeightProduct(null); return; }
        if (discountOpen) { setDiscountOpen(false); return; }
        if (pinOpen) { setPinOpen(false); setPinTarget(null); return; }
        if (qtyOpen) { setQtyOpen(false); setQtyItem(null); return; }
        if (paymentOpen) { setPaymentOpen(false); return; }
        if (operatorOpen) { setOperatorOpen(false); return; }
        if (produtosOpen) { setProdutosOpen(false); return; }
        if (panelOpen) { setPanelOpen(false); return; }
        if (fechamentoOpen) { setFechamentoOpen(false); return; }
        if (tutorialOpen) { handleCloseTutorial(); return; }
        return;
      }

      if (paymentOpen || operatorOpen || pinOpen || qtyOpen || panelOpen || fechamentoOpen || produtosOpen || tutorialOpen || receiptOpen || discountOpen || weightOpen || itemDiscountOpen) return;

      switch (e.key) {
        case "F1":
          e.preventDefault();
          showToast("Supervisor chamado — aguarde");
          break;
        case "F2":
          e.preventDefault();
          if (items.length) setPaymentOpen(true);
          else { buzzError(); showToast("Nenhum item no carrinho"); }
          break;
        case "F3":
          e.preventDefault();
          simulateScan();
          break;
        case "F4":
          e.preventDefault();
          if (items.length) { setItems([]); setScanIndex(0); buzzError(); showToast("Compra cancelada"); }
          break;
        case "F5":
          e.preventDefault();
          setProdutosOpen(true);
          break;
        case "F6":
          e.preventDefault();
          setFechamentoOpen(true);
          break;
        case "F8":
          e.preventDefault();
          setOperatorOpen(true);
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [paymentOpen, operatorOpen, pinOpen, qtyOpen, panelOpen, fechamentoOpen, produtosOpen, tutorialOpen, receiptOpen, discountOpen, weightOpen, items, simulateScan, showToast, handleCloseTutorial]);

  // Tutorial steps with live demos
  const tutorialSteps = useMemo((): TutorialStep[] => {
    const searchType = (text: string) => {
      const input = document.querySelector("[data-tour='search'] input") as HTMLInputElement | null;
      if (!input) return;
      const nativeInputValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
      nativeInputValue?.set?.call(input, text);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    };
    const searchClear = () => {
      const input = document.querySelector("[data-tour='search'] input") as HTMLInputElement | null;
      if (!input) return;
      const nativeInputValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
      nativeInputValue?.set?.call(input, "");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };
    const openContextOnFirstItem = () => {
      const row = document.querySelector("[data-item-id]") as HTMLElement | null;
      if (!row) return;
      const itemId = parseInt(row.getAttribute("data-item-id") || "0");
      if (!itemId) return;
      const rect = row.getBoundingClientRect();
      setContextMenu({ x: rect.right - 210, y: rect.top + 4, itemId });
    };

    return [
      // ── 1. Scan ──────────────────────────────────────────────────────────
      {
        selector: "[data-tour='scan']",
        title: "Simular Scan",
        description: "Simula a leitura de um código de barras. No caixa real, o leitor físico adiciona o produto automaticamente. Os 3 itens acima foram escaneados assim.",
        shortcuts: ["F3"],
        position: "top",
      },
      // ── 2. Busca ─────────────────────────────────────────────────────────
      {
        selector: "[data-tour='search']",
        title: "Busca de Produtos",
        description: "Busque por nome ou código. Digitar o código exato e pressionar Enter adiciona o produto sem clicar.",
        position: "left",
        onEnter: () => setTimeout(() => searchType("leite"), 100),
        onLeave: searchClear,
      },
      // ── 3. Carrinho ───────────────────────────────────────────────────────
      {
        selector: "[data-tour='cart']",
        title: "Carrinho",
        description: "Lista todos os itens escaneados. Clique com o botão direito em qualquer item para ver as opções disponíveis.",
        position: "right",
        onEnter: searchClear,
      },
      // ── 4. Menu de contexto ───────────────────────────────────────────────
      {
        selector: "[data-tour='context-menu']",
        title: "Menu de Contexto",
        description: "Com botão direito num item: altere quantidade, consulte o preço unitário, aplique desconto individual ou remova o item.",
        position: "left",
        onEnter: openContextOnFirstItem,
        onLeave: () => setContextMenu(null),
      },
      // ── 5. Alterar quantidade ─────────────────────────────────────────────
      {
        selector: "[data-tour='qty-modal']",
        title: "Alterar Quantidade",
        description: "Ajuste a quantidade do item com + / − ou digitando diretamente. Reduzir para zero remove o item do carrinho.",
        position: "left",
        onEnter: () => {
          setContextMenu(null);
          if (items.length === 0) return;
          setQtyItem(items[0]); setQtyOpen(true);
        },
        onLeave: () => { setQtyOpen(false); setQtyItem(null); },
      },
      // ── 6. Desconto por item ──────────────────────────────────────────────
      {
        selector: "[data-tour='item-discount-modal']",
        title: "Desconto por Item",
        description: "Aplique um percentual de desconto individual em qualquer produto. O carrinho mostra o preço riscado e o valor final destacado.",
        position: "left",
        onEnter: () => {
          if (items.length === 0) return;
          setItemDiscountTarget(items[0]); setItemDiscountOpen(true);
        },
        onLeave: () => { setItemDiscountOpen(false); setItemDiscountTarget(null); },
      },
      // ── 7. Botão desconto global ──────────────────────────────────────────
      {
        selector: "[data-tour='discount']",
        title: "Desconto Global — Botão",
        description: "Aplica desconto sobre o total da venda inteira (em % ou R$). Clique aqui para abrir o painel de desconto.",
        position: "top",
      },
      // ── 8. Modal desconto global ──────────────────────────────────────────
      {
        selector: "[data-tour='discount-modal']",
        title: "Desconto Global",
        description: "Escolha entre porcentagem ou valor fixo em reais. O resumo mostra subtotal, desconto e novo total em tempo real.",
        position: "left",
        onEnter: () => setDiscountOpen(true),
        onLeave: () => setDiscountOpen(false),
      },
      // ── 9. Total ──────────────────────────────────────────────────────────
      {
        selector: "[data-tour='total']",
        title: "Total da Compra",
        description: "Atualizado em tempo real: reflete descontos globais e por item automaticamente. Fica verde quando há desconto ativo.",
        position: "top",
      },
      // ── 10. Botão finalizar ───────────────────────────────────────────────
      {
        selector: "[data-tour='finalize']",
        title: "Finalizar — Botão",
        description: "Abre o modal de pagamento para fechar a venda. Também disponível via atalho de teclado.",
        shortcuts: ["F2"],
        position: "top",
      },
      // ── 11. Modal pagamento ───────────────────────────────────────────────
      {
        selector: "[data-tour='payment-modal']",
        title: "Pagamento",
        description: "Pix, Crédito, Débito, Dinheiro (com troco automático) ou Vale-refeição. Suporta pagamento dividido entre múltiplos métodos.",
        position: "left",
        onEnter: () => setPaymentOpen(true),
        onLeave: () => setPaymentOpen(false),
      },
      // ── 12. Supervisor ────────────────────────────────────────────────────
      {
        selector: "[data-tour='supervisor']",
        title: "Chamar Supervisor",
        description: "Aciona o supervisor de turno. Necessário para liberar estornos e autorizações especiais com senha.",
        shortcuts: ["F1"],
        position: "bottom",
      },
      // ── 13. Botão histórico ───────────────────────────────────────────────
      {
        selector: "[data-tour='historico']",
        title: "Histórico — Botão",
        description: "Acessa todas as vendas do operador logado, com filtro por período.",
        position: "bottom",
      },
      // ── 14. Painel do operador ────────────────────────────────────────────
      {
        selector: "[data-tour='panel-modal']",
        title: "Histórico de Vendas",
        description: "Lista todas as vendas com valor, método e horário. Para estornar: informe o valor (pode ser parcial) e confirme com a senha do supervisor.",
        position: "left",
        onEnter: () => { setPanelOperator(currentOperator); setPanelOpen(true); },
        onLeave: () => setPanelOpen(false),
      },
      // ── 15. Botão fechamento ──────────────────────────────────────────────
      {
        selector: "[data-tour='fechamento']",
        title: "Fechamento — Botão",
        description: "Acessa o resumo diário de vendas por método de pagamento.",
        shortcuts: ["F6"],
        position: "bottom",
      },
      // ── 16. Drawer fechamento ─────────────────────────────────────────────
      {
        selector: "[data-tour='fechamento-modal']",
        title: "Fechamento de Caixa",
        description: "Gráfico de barras por método, conferência de dinheiro em caixa (esperado vs. contado) e impressão do relatório.",
        position: "left",
        onEnter: () => setFechamentoOpen(true),
        onLeave: () => setFechamentoOpen(false),
      },
      // ── 17. Botão produtos ────────────────────────────────────────────────
      {
        selector: "[data-tour='produtos']",
        title: "Produtos — Botão",
        description: "Abre o catálogo de produtos para adicionar, editar ou remover itens.",
        shortcuts: ["F5"],
        position: "bottom",
      },
      // ── 18. Modal produtos ────────────────────────────────────────────────
      {
        selector: "[data-tour='produtos-modal']",
        title: "Gestão de Produtos",
        description: "Cadastre com código, nome e preço. Escolha 'un' para unidade ou 'kg' para balança — produtos kg pedem o peso na hora do scan.",
        position: "left",
        onEnter: () => setProdutosOpen(true),
        onLeave: () => setProdutosOpen(false),
      },
      // ── 19. Dark mode ─────────────────────────────────────────────────────
      {
        selector: "[data-tour='darkmode']",
        title: "Modo Escuro",
        description: "Alterna entre tema claro e escuro. Ideal para turnos noturnos, reduzindo o cansaço visual.",
        position: "bottom",
        onEnter: toggleDark,
        onLeave: toggleDark,
      },
      // ── 20. Botão operador ────────────────────────────────────────────────
      {
        selector: "[data-tour='operator']",
        title: "Trocar Operador — Botão",
        description: "Exibe os operadores disponíveis. Cada um tem histórico e fechamento independentes.",
        shortcuts: ["F8"],
        position: "bottom",
      },
      // ── 21. Modal operador ────────────────────────────────────────────────
      {
        selector: "[data-tour='operator-modal']",
        title: "Trocar Operador",
        description: "Selecione um operador e autentique com o PIN de 4 dígitos para assumir o caixa.",
        position: "left",
        onEnter: () => setOperatorOpen(true),
        onLeave: () => setOperatorOpen(false),
      },
    ];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOperator, toggleDark, simulateScan, items]);

  const subtotal = items.reduce((s, i) => {
    const lineTotal = i.price * i.qty;
    return s + (i.itemDiscount ? lineTotal * (1 - i.itemDiscount / 100) : lineTotal);
  }, 0);
  const total = Math.max(0, subtotal - discount);
  const itemCount = items.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <div className="page-enter page-enter-1">
        <Header operator={currentOperator} onOperatorClick={() => setOperatorOpen(true)} dark={dark} onToggleDark={toggleDark} onHistorico={() => { setPanelOperator(currentOperator); setPanelOpen(true); }} onFechamento={() => setFechamentoOpen(true)} onProdutos={() => setProdutosOpen(true)} onCallSupervisor={() => showToast("Supervisor chamado — aguarde")} onTutorial={handleOpenTutorial} />
      </div>

      <main className="flex flex-1 overflow-hidden">
        <div className="page-enter page-enter-2 flex flex-1 min-w-0">
          <ItemList
            items={items}
            onContextMenu={(x, y, itemId) => setContextMenu({ x, y, itemId })}
          />
        </div>
        <div className="page-enter page-enter-3 flex">
          <SearchPanel products={products} onAddItem={addItem} />
        </div>
      </main>

      <div className="page-enter page-enter-4">
      <Footer
        total={total}
        subtotal={discount > 0 ? subtotal : undefined}
        discount={discount > 0 ? discount : undefined}
        itemCount={itemCount}
        onSimulateScan={simulateScan}
        onFinalize={() => items.length ? setPaymentOpen(true) : (buzzError(), showToast("Nenhum item no carrinho"))}
        onCancelSale={() => { setItems([]); setScanIndex(0); setDiscount(0); buzzError(); showToast("Compra cancelada"); }}
        onDiscount={() => items.length ? setDiscountOpen(true) : (buzzError(), showToast("Nenhum item no carrinho"))}
      />
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAction={handleContextAction}
          onClose={() => setContextMenu(null)}
        />
      )}

      <PaymentModal open={paymentOpen} total={total} onConfirm={handlePaymentConfirm} onClose={() => setPaymentOpen(false)} />
      <OperatorModal open={operatorOpen} operators={operators} currentOperator={currentOperator} onSelect={handleSelectOperator} onClose={() => setOperatorOpen(false)} />
      <PinModal open={pinOpen} target={pinTarget} onSuccess={handlePinSuccess} onClose={() => { setPinOpen(false); setPinTarget(null); }} />
      <QtyModal open={qtyOpen} item={qtyItem} onConfirm={handleQtyConfirm} onClose={() => { setQtyOpen(false); setQtyItem(null); }} />
      <OperatorPanelModal open={panelOpen} operator={panelOperator} onClose={() => setPanelOpen(false)} onRefund={handleRefund} />
      <FechamentoDrawer open={fechamentoOpen} operator={currentOperator} onClose={() => setFechamentoOpen(false)} />
      <ProdutosModal open={produtosOpen} products={products} onSave={setProducts} onClose={() => setProdutosOpen(false)} />
      <DiscountModal open={discountOpen} subtotal={subtotal} onApply={handleApplyDiscount} onClose={() => setDiscountOpen(false)} />
      <WeightModal open={weightOpen} product={weightProduct} onConfirm={handleWeightConfirm} onClose={() => { setWeightOpen(false); setWeightProduct(null); }} />
      <ItemDiscountModal open={itemDiscountOpen} item={itemDiscountTarget} onConfirm={handleItemDiscount} onClose={() => { setItemDiscountOpen(false); setItemDiscountTarget(null); }} />
      <ReceiptModal open={receiptOpen} itemCount={receiptData?.itemCount ?? 0} total={receiptData?.total ?? 0} method={receiptData?.method ?? ""} saleNumber={receiptData?.saleNumber} onClose={() => setReceiptOpen(false)} />
      <Tutorial open={tutorialOpen} steps={tutorialSteps} onClose={handleCloseTutorial} />

      <ScanFlash type={scanFlash} />
      <Toast message={toast} />
      <OfflineIndicator />
    </>
  );
}
