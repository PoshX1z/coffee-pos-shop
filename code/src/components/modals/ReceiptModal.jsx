import {
  formatBaht,
  formatThaiDateTime,
  PAYMENT_LABELS,
  PAYMENT_STATUS_LABELS,
  STATUS_LABELS,
} from "../../types/pos";
import { Icon } from "../ui/Icon.jsx";
import { ProductImage } from "../ui/ProductImage.jsx";

export const ReceiptModal = ({
  isOpen,
  orderDetail,
  allowStatusChange,
  isSubmitting,
  onClose,
  onUpdateStatus,
}) => {
  if (!isOpen || !orderDetail) return null;

  const paid = orderDetail.payment?.status === "PAID";
  const statusColor =
    orderDetail.status === "SUCCESS"
      ? "bg-emerald-100 text-emerald-800"
      : orderDetail.status === "CANCELLED"
        ? "bg-red-100 text-red-800"
        : "bg-amber-100 text-amber-800";
  const showActions = allowStatusChange && orderDetail.status === "PENDING";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-900/50 p-4">
      <div className="w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl max-h-[calc(100dvh-2rem)]">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-base">
          <header className="bg-blue-50 px-6 py-6 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-blue-700 text-white">
              <Icon name="cup" className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {paid ? "ใบเสร็จรับเงิน" : "รายละเอียดออเดอร์"}
            </h2>
            <div className="mt-1 text-slate-600">
              หมายเลขออเดอร์{" "}
              <span className="font-semibold">#{orderDetail.order_id}</span>
            </div>
            <span
              className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusColor}`}
            >
              {STATUS_LABELS[orderDetail.status] || orderDetail.status}
            </span>
          </header>

          <div className="space-y-6 p-5 sm:p-6">
            <section className="grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
              <div>
                <div className="text-sm text-slate-500">ลูกค้า</div>
                <div className="mt-1 font-semibold">
                  {orderDetail.customer_name || "ลูกค้าทั่วไป"}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-500">เบอร์โทรศัพท์</div>
                <div className="mt-1 font-semibold">
                  {orderDetail.customer_phone || "-"}
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-sm text-slate-500">
                  วันที่และเวลาสั่ง (เวลาไทย)
                </div>
                <div className="mt-1 font-medium">
                  {formatThaiDateTime(orderDetail.order_time)}
                </div>
              </div>
            </section>

            <section>
              <div className="mb-1 flex items-center justify-between border-b border-slate-200 pb-2 text-sm font-semibold text-slate-500">
                <span>รายการสินค้า</span>
                <span>ยอดรวม</span>
              </div>
              {(orderDetail.items || []).length ? (
                orderDetail.items.map((item, index) => (
                  <div
                    key={`${item.product_id || item.name}-${index}`}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-dashed border-slate-200 py-4 last:border-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <ProductImage
                          src={item.image_data || item.imageData}
                          iconClass="h-6 w-6 text-slate-300"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-800">
                          {item.name}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {formatBaht(item.price)} ×{" "}
                          {Number(item.quantity).toLocaleString("th-TH")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-semibold">
                      {formatBaht(item.subtotal)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-500">
                  ไม่มีรายการสินค้า
                </div>
              )}
            </section>

            <section className="flex items-center justify-between gap-4 rounded-xl bg-blue-50 p-4 sm:p-5">
              <span className="font-semibold text-slate-700">ยอดชำระรวม</span>
              <span className="text-2xl font-bold text-blue-800">
                {formatBaht(orderDetail.total_price)}
              </span>
            </section>

            <section className="rounded-xl border border-slate-200 p-4 sm:p-5">
              {orderDetail.payment ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm text-slate-500">วิธีชำระเงิน</div>
                      <div className="mt-1 font-semibold">
                        {PAYMENT_LABELS[orderDetail.payment.method] ||
                          orderDetail.payment.method}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1.5 text-sm font-semibold ${paid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
                    >
                      {PAYMENT_STATUS_LABELS[orderDetail.payment.status] ||
                        orderDetail.payment.status}
                    </span>
                  </div>
                  {orderDetail.payment.receipt_date && (
                    <div className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-500">
                      ออกใบเสร็จเมื่อ{" "}
                      {formatThaiDateTime(orderDetail.payment.receipt_date)}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-slate-600">
                  ยังไม่มีข้อมูลการชำระเงิน
                </div>
              )}
            </section>

            {showActions && (
              <div className="flex gap-2">
                <button
                  disabled={isSubmitting}
                  onClick={() => onUpdateStatus("SUCCESS")}
                  className="flex-1 h-11 rounded-xl bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all"
                >
                  ออเดอร์สำเร็จ
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => onUpdateStatus("CANCELLED")}
                  className="flex-1 h-11 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 active:bg-red-100 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all"
                >
                  ยกเลิกออเดอร์
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="h-11 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 active:scale-95 cursor-pointer transition-all"
            >
              ปิด
            </button>
          </div>
        </article>
      </div>
    </div>
  );
};
