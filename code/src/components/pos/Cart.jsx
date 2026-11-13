import { ProductImage } from "../ui/ProductImage.jsx";
import { formatBaht } from "../../types/pos";

export const Cart = ({
  cart,
  menu,
  onUpdateQuantity,
  onClearCart,
  onCheckout,
}) => {
  const rows = Object.entries(cart)
    .map(([id, quantity]) => ({
      product: menu.find((p) => String(p.id) === id),
      quantity,
    }))
    .filter((row) => row.product);

  const count = rows.reduce((sum, row) => sum + row.quantity, 0);
  const total = rows.reduce(
    (sum, row) => sum + row.quantity * row.product.price,
    0,
  );

  return (
    <aside className="mt-6 lg:mt-0 lg:sticky lg:top-24 flex flex-col bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">
          รายการสั่งซื้อ{" "}
          <span className="text-sm text-slate-500">({count} ชิ้น)</span>
        </h2>
        {count > 0 && (
          <button
            onClick={onClearCart}
            className="text-xs text-red-600 hover:text-red-700 active:text-red-800 cursor-pointer font-medium transition-colors"
          >
            ล้างตะกร้า
          </button>
        )}
      </div>

      <div className="mt-3 divide-y divide-slate-100 max-h-[50vh] overflow-y-auto">
        {rows.length > 0 ? (
          rows.map(({ product: p, quantity }) => (
            <div key={p.id} className="flex items-center gap-3 py-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 grid place-items-center overflow-hidden shrink-0">
                <ProductImage
                  src={p.imageData}
                  iconClass="w-5 h-5 text-slate-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-xs text-slate-500">
                  {formatBaht(p.price * quantity)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateQuantity(p.id, -1)}
                  className="w-8 h-8 grid place-items-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 active:bg-slate-200 active:scale-95 cursor-pointer transition-all"
                >
                  −
                </button>
                <span className="text-sm font-medium w-4 text-center">
                  {quantity}
                </span>
                <button
                  disabled={quantity >= p.maxOrderQuantity}
                  onClick={() => onUpdateQuantity(p.id, 1)}
                  className="w-8 h-8 grid place-items-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 active:bg-slate-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer transition-all"
                >
                  +
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center text-sm text-slate-500">
            เลือกสินค้าเพื่อเริ่มรายการสั่งซื้อ
          </div>
        )}
      </div>

      <div className="mt-3 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span>ยอดรวม</span>
          <span className="text-xl font-bold">{formatBaht(total)}</span>
        </div>
        <button
          disabled={!count}
          onClick={onCheckout}
          className="mt-4 h-12 w-full rounded-xl bg-blue-700 text-white font-medium flex items-center justify-center gap-2 hover:bg-blue-500 active:bg-blue-900 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer transition-all"
        >
          ชำระเงิน
        </button>
      </div>
    </aside>
  );
};
