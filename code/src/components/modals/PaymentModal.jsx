export const PaymentModal = ({ isOpen, error, detail, onClose, onSubmit }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 grid place-items-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain p-5">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          ชำระเงินปิดออเดอร์
        </h2>
        {detail && (
          <div className="mb-4 rounded-xl bg-slate-50 p-4 text-sm">
            <div className="font-semibold">
              Order ID: ORD-{String(detail.orderId).padStart(6, "0")}
            </div>
            <div className="mt-1 text-slate-600">
              ยอดชำระ:{" "}
              {Number(detail.total || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="mt-2">
              {detail.method === "CASH"
                ? "ชำระเงินสดที่หน้าเคาเตอร์."
                : detail.method === "QR"
                  ? "สแกน QR code เพื่อชำระเงิน."
                  : "โอนผ่านธนาคาร ที่เลขบัญชี: 123-4-56789-0"}
            </div>
            <div className="mt-3 grid w-32 grid-cols-7 gap-1">
              {detail.method === "QR" &&
                Array.from({ length: 49 }, (_, i) => (
                  <span
                    key={i}
                    className={`aspect-square ${[0, 1, 2, 7, 9, 14, 15, 16, 21, 28, 29, 30, 34, 36, 38, 40, 42, 44, 46, 48].includes(i) || (i * 13 + 7) % 5 < 2 ? "bg-slate-900" : "bg-white"}`}
                  />
                ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              โปรดตรวจสอบยอดชำระเงินให้ละเอียด
            </p>
          </div>
        )}
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              ชำระเงิน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
