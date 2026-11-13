import { useState } from "react";

export const CheckoutModal = ({ isOpen, error, onClose, onSubmit }) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(customerPhone)) return;
    onSubmit({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      paymentMethod,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 grid place-items-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          ยืนยันรายการสั่งซื้อ
        </h2>
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              ชื่อลูกค้า
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              minLength={10}
              maxLength={10}
              required
              title="Enter exactly 10 digits"
              value={customerPhone}
              onChange={(e) =>
                setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              วิธีชำระเงิน
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm bg-white cursor-pointer"
            >
              <option value="CASH">เงินสด</option>
              <option value="QR">คิวอาร์โค้ด</option>
              <option value="TRANSFER">โอนธนาคาร</option>
              <option value="CARD">บัตรเครดิต</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-10 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-100 active:bg-slate-200 active:scale-95 text-slate-600 cursor-pointer transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 h-10 bg-blue-700 text-white rounded-xl text-sm font-medium hover:bg-blue-800 active:bg-blue-900 active:scale-95 cursor-pointer transition-all"
            >
              ยืนยันการสั่งซื้อ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
