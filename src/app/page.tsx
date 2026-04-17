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
        if (tutorialOpen) { setTutorialOpen(false); return; }
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
  }, [paymentOpen, operatorOpen, pinOpen, qtyOpen, panelOpen, fechamentoOpen, produtosOpen, tutorialOpen, receiptOpen, discountOpen, weightOpen, items, simulateScan, showToast]);

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

    return [
      {
        selector: "[data-tour='scan']",
        title: "Simular Scan",
        description: "Simula a leitura de um código de barras. No uso real, o leitor físico adicionaria o produto automaticamente.",
        shortcuts: ["F3"],
        position: "top",
        // items already pre-scanned when tutorial opens
      },
      {
        selector: "[data-tour='search']",
        title: "Busca de Produtos",
        description: "Busque por nome ou código de barras. Digitar o código exato e pressionar Enter adiciona o produto direto ao carrinho.",
        position: "left",
        onEnter: () => setTimeout(() => searchType("leite"), 100),
        onLeave: searchClear,
      },
      {
        selector: "[data-tour='cart']",
        title: "Carrinho",
        description: "Lista os itens escaneados. Clique com o botão direito para: alterar quantidade, consultar preço, aplicar desconto individual no item ou removê-lo.",
        position: "right",
      },
      {
        selector: "[data-tour='discount']",
        title: "Desconto",
        description: "Aplica um desconto global em reais ou porcentagem sobre o total da venda. Para descontos em itens específicos, clique com o botão direito no item desejado no carrinho.",
        position: "top",
        onEnter: () => setTimeout(() => setDiscountOpen(true), 150),
        onLeave: () => setDiscountOpen(false),
      },
      {
        selector: "[data-tour='total']",
        title: "Total da Compra",
        description: "Exibe a quantidade de itens e o valor total atualizado em tempo real, já considerando descontos globais e por item.",
        position: "top",
      },
      {
        selector: "[data-tour='finalize']",
        title: "Finalizar Venda",
        description: "Abre o modal de pagamento: Pix, Crédito, Débito, Dinheiro (com cálculo de troco) ou Vale. Também suporta pagamento dividido entre múltiplos métodos.",
        shortcuts: ["F2"],
        position: "top",
        onEnter: () => setTimeout(() => setPaymentOpen(true), 150),
        onLeave: () => setPaymentOpen(false),
      },
      {
        selector: "[data-tour='supervisor']",
        title: "Chamar Supervisor",
        description: "Envia um alerta para o supervisor de turno. Necessário para autorizações especiais como estornos com senha.",
        shortcuts: ["F1"],
        position: "bottom",
      },
      {
        selector: "[data-tour='historico']",
        title: "Histórico de Vendas",
        description: "Todas as vendas do operador, filtráveis por dia, mês ou ano. Para estornar uma venda, informe o valor (parcial ou total) e autentique com a senha do supervisor.",
        shortcuts: ["Esc fecha"],
        position: "bottom",
        onEnter: () => setTimeout(() => { setPanelOperator(currentOperator); setPanelOpen(true); }, 150),
        onLeave: () => setPanelOpen(false),
      },
      {
        selector: "[data-tour='fechamento']",
        title: "Fechamento de Caixa",
        description: "Resumo diário por método de pagamento com gráfico de barras. Inicie a conferência para comparar o dinheiro esperado com o contado. Imprima o relatório pelo ícone de impressora.",
        shortcuts: ["F6", "Esc fecha"],
        position: "bottom",
        onEnter: () => setTimeout(() => setFechamentoOpen(true), 150),
        onLeave: () => setFechamentoOpen(false),
      },
      {
        selector: "[data-tour='produtos']",
        title: "Gestão de Produtos",
        description: "Adicione, edite ou remova produtos do catálogo. Ao cadastrar, escolha a unidade: 'un' para itens avulsos ou 'kg' para produtos de balança (pesagem automática ao escanear).",
        shortcuts: ["F5", "Esc fecha"],
        position: "bottom",
        onEnter: () => setTimeout(() => setProdutosOpen(true), 150),
        onLeave: () => setProdutosOpen(false),
      },
      {
        selector: "[data-tour='darkmode']",
        title: "Modo Escuro",
        description: "Alterna entre tema claro e escuro. Útil para turnos noturnos, reduzindo o cansaço visual do operador.",
        position: "bottom",
        onEnter: toggleDark,
        onLeave: toggleDark,
      },
      {
        selector: "[data-tour='operator']",
        title: "Trocar Operador",
        description: "Selecione outro operador e autentique com PIN de 4 dígitos. Cada operador tem histórico e fechamento independentes.",
        shortcuts: ["F8", "Esc fecha"],
        position: "bottom",
        onEnter: () => setTimeout(() => setOperatorOpen(true), 150),
        onLeave: () => setOperatorOpen(false),
      },
    ];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOperator, toggleDark, simulateScan]);

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
      <Tutorial open={tutorialOpen} steps={tutorialSteps} onClose={() => setTutorialOpen(false)} />

      <ScanFlash type={scanFlash} />
      <Toast message={toast} />
      <OfflineIndicator />
    </>
  );
}
