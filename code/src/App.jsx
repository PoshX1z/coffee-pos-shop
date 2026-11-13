import { useState, useEffect, useCallback } from "react";
import { Nav } from "./components/navigation/Nav";
import { OrderView } from "./components/pos/OrderVIew.jsx";
import { MenuList } from "./components/menu/MenuList";
import { IngredientList } from "./components/ingredients/IngredientList";
import { ReportView } from "./components/reports/ReportView";
import { MenuModal } from "./components/modals/MenuModal";
import { IngredientModal } from "./components/modals/IngredientModal";
import { CheckoutModal } from "./components/modals/CheckoutModal";
import { PaymentModal } from "./components/modals/PaymentModal";
import { ReceiptModal } from "./components/modals/ReceiptModal";
import { Toast } from "./components/ui/Toast";
import { Icon } from "./components/ui/Icon.jsx";
import { normalizeProduct, STATUS_LABELS } from "./types/pos";

const API = "/api";
async function request(path, options = {}) {
  const response = await fetch(API + path, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const data =
    response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      data?.error || `เขื่อมต่อ Backend API ไม่สำเร็จ (${response.status})`,
    );
  return data;
}

export const App = () => {
  const [tab, setTab] = useState("order");
  const [menu, setMenu] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [cart, setCart] = useState({});
  const [report, setReport] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menuError, setMenuError] = useState(null);

  const [posCat, setPosCat] = useState("ทั้งหมด");
  const [posQ, setPosQ] = useState("");
  const [menuCat, setMenuCat] = useState("ทั้งหมด");
  const [menuQ, setMenuQ] = useState("");

  const [toastMessage, setToastMessage] = useState("");

  // Modals state
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [pendingPaymentOrderId, setPendingPaymentOrderId] = useState(null);
  const [pendingPaymentDetail, setPendingPaymentDetail] = useState(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [allowStatusChange, setAllowStatusChange] = useState(true);
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const categories = [
    ...new Set(menu.map((item) => item.category).filter(Boolean)),
  ];

  const loadMenu = useCallback(async () => {
    try {
      const data = await request("/menu");
      setMenu(data.map(normalizeProduct));
      setMenuError(null);
    } catch (err) {
      setMenu([]);
      setMenuError(err.message);
      showToast(`โหลดสินค้าไม่สำเร็จ: ${err.message}`);
    }
  }, []);

  const loadIngredients = useCallback(async () => {
    try {
      const rows = await request("/ingredients");
      setIngredients(rows);
    } catch (err) {
      showToast(`โหลดวัตถุดิบไม่สำเร็จ: ${err.message}`);
    }
  }, []);

  const loadReport = useCallback(async () => {
    try {
      const [reportData, ordersData] = await Promise.all([
        request("/reports/sales"),
        request("/orders"),
      ]);
      setReport(reportData);
      setOrders(ordersData);
    } catch (err) {
      showToast(`โหลดรายงานไม่สำเร็จ: ${err.message}`);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  useEffect(() => {
    if (tab === "menu") loadMenu();
    if (tab === "ingredient") loadIngredients();
    if (tab === "report") loadReport();
  }, [tab, loadMenu, loadIngredients, loadReport]);

  useEffect(() => {
    let timer = null;
    if (tab === "report") {
      timer = setInterval(() => {
        loadReport();
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [tab, loadReport]);

  const handleAddToCart = (id) => {
    const product = menu.find((item) => String(item.id) === String(id));
    if (!product || (cart[id] || 0) >= product.maxOrderQuantity) return;
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleUpdateQuantity = (id, delta) => {
    setCart((prev) => {
      const next = { ...prev };
      const current = next[id] || 0;
      const product = menu.find((item) => String(item.id) === String(id));

      if (delta > 0 && product && current < product.maxOrderQuantity) {
        next[id] = current + 1;
      } else if (delta < 0) {
        if (current + delta <= 0) delete next[id];
        else next[id] = current + delta;
      }
      return next;
    });
  };

  const handleOpenMenuForm = async (product = null) => {
    if (!ingredients.length) {
      try {
        const rows = await request("/ingredients");
        setIngredients(rows);
      } catch (err) {
        showToast(`โหลดวัตถุดิบไม่สำเร็จ: ${err.message}`);
        return;
      }
    }
    setEditingProduct(product);
    setIsMenuModalOpen(true);
  };

  const handleSaveMenu = async ({
    id,
    name,
    category,
    price,
    imageData,
    removeImage,
    recipe,
  }) => {
    try {
      const body = { name, category, price, imageData, removeImage };
      const result = id
        ? await request("/menu/" + encodeURIComponent(id), {
            method: "PUT",
            body: JSON.stringify(body),
          })
        : await request("/menu", {
            method: "POST",
            body: JSON.stringify(body),
          });

      const productId = id || result.productId;
      await request(`/menu/${encodeURIComponent(productId)}/recipe`, {
        method: "PUT",
        body: JSON.stringify({ ingredients: recipe }),
      });

      setIsMenuModalOpen(false);
      setIngredients([]);
      await loadMenu();
      showToast(
        id ? "บันทึกเมนูและสูตรวัตถุดิบแล้ว" : "เพิ่มเมนูและสูตรวัตถุดิบแล้ว",
      );
    } catch (err) {
      showToast(`บันทึกสินค้าไม่สำเร็จ: ${err.message}`);
    }
  };

  const handleDeleteMenu = async (id) => {
    if (!confirm("ต้องการลบสินค้านี้หรือไม่?")) return;
    try {
      await request("/menu/" + encodeURIComponent(id), { method: "DELETE" });
      await loadMenu();
      showToast("ลบสินค้าแล้ว");
    } catch (err) {
      showToast(`ลบสินค้าไม่สำเร็จ: ${err.message}`);
    }
  };

  const handleOpenIngredientForm = (ingredient = null) => {
    setEditingIngredient(ingredient);
    setIsIngredientModalOpen(true);
  };

  const handleSaveIngredient = async (payload) => {
    const { ingredientId, name, quantity, unit, minThreshold } = payload;
    try {
      await request(
        ingredientId
          ? `/ingredients/${encodeURIComponent(ingredientId)}`
          : "/ingredients",
        {
          method: ingredientId ? "PUT" : "POST",
          body: JSON.stringify({ name, quantity, unit, minThreshold }),
        },
      );
      setIsIngredientModalOpen(false);
      setIngredients([]);
      await loadIngredients();
      await loadMenu();
      showToast(ingredientId ? "แก้ไขวัตถุดิบแล้ว" : "เพิ่มวัตถุดิบแล้ว");
    } catch (err) {
      showToast(`บันทึกวัตถุดิบไม่สำเร็จ: ${err.message}`);
    }
  };

  /*
  const handleDeleteIngredient = async (id) => {
    const ingredient = ingredients.find(
      (item) => String(item.ingredient_id) === String(id),
    );
    if (
      !confirm(
        `ยืนยันลบวัตถุดิบ “${ingredient?.name || ""}” หรือไม่? เมนูที่ใช้วัตถุดิบนี้จะต้องกำหนดสูตรใหม่ และหากวัตถุดิบนี้เคยถูกใช้ในออเดอร์ ระบบจะลบไม่ได้เพื่อเก็บประวัติไว้`,
      )
    )
      return;

    try {
      const result = await request(`/ingredients/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setIngredients([]);
      await loadIngredients();
      await loadMenu();
      showToast(
        result.affectedMenus
          ? `ลบวัตถุดิบแล้ว เมนู ${result.affectedMenus} รายการต้องกำหนดสูตรใหม่`
          : "ลบวัตถุดิบแล้ว",
      );
    } catch (err) {
      showToast(`ลบวัตถุดิบไม่สำเร็จ: ${err.message}`);
    }
  };
  */

  const handleCheckoutSubmit = async ({
    customerName,
    customerPhone,
    paymentMethod,
  }) => {
    // convert object to array (key-value pair)
    const items = Object.entries(cart).map(([productId, quantity]) => ({
      productId: Number(productId),
      quantity,
    }));

    try {
      const result = await request("/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName,
          customerPhone,
          paymentMethod,
          items,
        }),
      });

      setIsCheckoutModalOpen(false);
      setCart({});
      await loadMenu();

      setPendingPaymentOrderId(result.orderId);
      setPendingPaymentDetail({
        orderId: result.orderId,
        method: result.payment?.method || paymentMethod,
        total: result.totalPrice,
      });
      setPaymentError("");
      setIsPaymentModalOpen(true);
      showToast(`บันทึกออเดอร์ #${result.orderId} แล้ว`);
    } catch (err) {
      setCheckoutError(err.message);
    }
  };

  const openOrderDetail = async (orderId, canChangeStatus = true) => {
    try {
      const detail = await request(`/orders/${encodeURIComponent(orderId)}`);
      setSelectedOrderDetail(detail);
      setAllowStatusChange(canChangeStatus);
      setIsReceiptModalOpen(true);
    } catch (err) {
      showToast(`โหลดออเดอร์ไม่สำเร็จ: ${err.message}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status, paymentMethod) => {
    setIsStatusSubmitting(true);
    try {
      await request(`/orders/${encodeURIComponent(orderId)}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          ...(paymentMethod ? { paymentMethod } : {}),
        }),
      });
      if (status === "CANCELLED") await loadMenu();
      await loadReport();
      await openOrderDetail(orderId, false);
      showToast(
        status === "CANCELLED"
          ? "ยกเลิกออเดอร์และคืนสต็อกวัตถุดิบแล้ว"
          : "รับชำระเงินและปิดออเดอร์แล้ว",
      );
    } catch (err) {
      showToast(`เปลี่ยนสถานะไม่สำเร็จ: ${err.message}`);
    } finally {
      setIsStatusSubmitting(false);
    }
  };

  const openPaymentForOrder = async (orderId) => {
    try {
      const detail = await request(`/orders/${encodeURIComponent(orderId)}`);
      setPendingPaymentOrderId(orderId);
      setPendingPaymentDetail({
        orderId,
        method: detail.payment?.method,
        total: detail.payment?.amount ?? detail.total_price,
      });
      setPaymentError("");
      setIsPaymentModalOpen(true);
    } catch (err) {
      showToast(`Could not open payment: ${err.message}`);
    }
  };
  const handleReceiptAction = (newStatus) => {
    if (!selectedOrderDetail) return;
    const orderId = selectedOrderDetail.order_id;

    if (newStatus === "สำเร็จ") {
      if (selectedOrderDetail.payment?.method) {
        handleUpdateOrderStatus(orderId, newStatus);
      } else {
        setPendingPaymentOrderId(orderId);
        setPaymentError("");
        setIsPaymentModalOpen(true);
      }
    } else if (newStatus === "CANCELLED") {
      if (confirm("ยืนยันยกเลิกออเดอร์นี้และคืนสต็อกวัตถุดิบหรือไม่?")) {
        handleUpdateOrderStatus(orderId, newStatus);
      }
    }
  };

  const handlePaymentSubmit = async () => {
    try {
      await request(
        `/orders/${encodeURIComponent(pendingPaymentOrderId)}/payment/success`,
        { method: "POST" },
      );
      setIsPaymentModalOpen(false);
      setPendingPaymentDetail(null);
      await loadMenu();
      await loadReport();
      await openOrderDetail(pendingPaymentOrderId, false);
    } catch (err) {
      setPaymentError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 font-sans text-slate-800 antialiased">
      <Nav activeTab={tab} onSelectTab={setTab} />

      <div className="min-h-screen pb-24 lg:ml-60 lg:pb-0">
        <header className="hidden lg:flex sticky top-0 z-20 h-16 items-center justify-end gap-3 px-8 bg-white/90 backdrop-blur border-b border-slate-200">
          <button
            className="w-10 h-10 grid place-items-center rounded-full bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900 active:scale-95 cursor-pointer transition-all"
            aria-label="User account"
          >
            <Icon name="user" />
          </button>
        </header>

        <main className="p-4 lg:p-8 max-w-[1600px] mx-auto">
          {tab === "order" && (
            <OrderView
              menu={menu}
              categories={categories}
              selectedCategory={posCat}
              searchQuery={posQ}
              cart={cart}
              menuError={menuError}
              onSelectCategory={setPosCat}
              onSearchChange={setPosQ}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateQuantity}
              onClearCart={() => setCart({})}
              onCheckout={() => {
                setCheckoutError("");
                setIsCheckoutModalOpen(true);
              }}
            />
          )}

          {tab === "menu" && (
            <MenuList
              menu={menu}
              categories={categories}
              selectedCategory={menuCat}
              searchQuery={menuQ}
              menuError={menuError}
              onSelectCategory={setMenuCat}
              onSearchChange={setMenuQ}
              onOpenForm={handleOpenMenuForm}
              onDeleteMenu={handleDeleteMenu}
            />
          )}

          {tab === "ingredient" && (
            <IngredientList
              ingredients={ingredients}
              onOpenIngredientForm={handleOpenIngredientForm}
              // onDeleteIngredient={handleDeleteIngredient}
            />
          )}

          {tab === "report" && (
            <ReportView
              report={report}
              orders={orders}
              menu={menu}
              onSelectOrder={(id) => openOrderDetail(id, true)}
              onPayment={openPaymentForOrder}
              onStatusChange={handleUpdateOrderStatus}
              isSubmitting={isStatusSubmitting}
            />
          )}
        </main>
      </div>

      <MenuModal
        isOpen={isMenuModalOpen}
        product={editingProduct}
        ingredients={ingredients}
        categories={categories}
        onClose={() => setIsMenuModalOpen(false)}
        onSubmit={handleSaveMenu}
      />

      <IngredientModal
        isOpen={isIngredientModalOpen}
        ingredient={editingIngredient}
        onClose={() => setIsIngredientModalOpen(false)}
        onSubmit={handleSaveIngredient}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        error={checkoutError}
        onClose={() => setIsCheckoutModalOpen(false)}
        onSubmit={handleCheckoutSubmit}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        error={paymentError}
        detail={pendingPaymentDetail}
        onClose={async () => {
          if (pendingPaymentDetail) {
            try {
              await handleUpdateOrderStatus(
                pendingPaymentOrderId,
                Object.keys(STATUS_LABELS)[1],
              );
              setIsPaymentModalOpen(false);
              setPendingPaymentDetail(null);
            } catch (err) {
              setPaymentError(err.message);
            }
          } else setIsPaymentModalOpen(false);
        }}
        onSubmit={handlePaymentSubmit}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        orderDetail={selectedOrderDetail}
        allowStatusChange={allowStatusChange}
        isSubmitting={isStatusSubmitting}
        onClose={() => setIsReceiptModalOpen(false)}
        onUpdateStatus={handleReceiptAction}
      />

      <Toast message={toastMessage} />
    </div>
  );
};

export default App;
