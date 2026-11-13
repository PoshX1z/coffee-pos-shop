import React from "react";
import { Icon } from "../ui/Icon.jsx";
import { formatBaht, formatThaiDateTime, STATUS_LABELS } from "../../types/pos";

export const ReportView = ({ report, orders, menu, onSelectOrder, onPayment, onStatusChange, isSubmitting }) => {
  const totalSales = report.reduce(
    (sum, row) => sum + Number(row.totalSales || 0),
    0,
  );
  const totalQty = report.reduce(
    (sum, row) => sum + Number(row.totalQuantity || 0),
    0,
  );
  const activeOrdersCount = orders.filter((o) => o.payment_status === "PAID" && o.status !== Object.keys(STATUS_LABELS)[1]).length;

  const sortedReport = [...report].sort(
    (a, b) => Number(b.totalSales) - Number(a.totalSales),
  );
  const maxSales = Math.max(
    ...sortedReport.map((row) => Number(row.totalSales)),
    1,
  );

  const byCategory = new Map();
  for (const row of report) {
    const product = menu.find((p) => String(p.id) === String(row.productId));
    const category = product?.category || "อื่น ๆ";
    byCategory.set(
      category,
      (byCategory.get(category) || 0) + Number(row.totalSales || 0),
    );
  }
  const categoriesSold = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);
  const categoryTotal = categoriesSold.reduce((sum, [, val]) => sum + val, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">รายงานยอดขาย</h1>
        <p className="text-sm text-slate-500">
          สรุปยอดขาย ประวัติออเดอร์ และการเคลื่อนไหว
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Icon name="coins" />
            ยอดขายรวม
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">
            {formatBaht(totalSales)}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Icon name="receipt" />
            จำนวนออเดอร์
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">
            {activeOrdersCount.toLocaleString("th-TH")}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Icon name="bag" />
            จำนวนสินค้าที่ขาย
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">
            {totalQty.toLocaleString("th-TH")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 lg:p-6">
          <h2 className="font-semibold text-slate-800 mb-4">ยอดขายตามสินค้า</h2>
          {sortedReport.length > 0 ? (
            <div className="space-y-3">
              {sortedReport.map((row) => (
                <div
                  key={row.productId || row.name}
                  className="grid grid-cols-[minmax(5rem,10rem)_1fr_auto] items-center gap-3 text-sm"
                >
                  <span className="truncate text-slate-700">{row.name}</span>
                  <div className="h-3 rounded bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-slate-700 rounded transition-all duration-300"
                      style={{
                        width: `${Math.max(1, (Number(row.totalSales) / maxSales) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="font-medium text-slate-800">
                    {formatBaht(row.totalSales)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-slate-500">
              ยังไม่มีข้อมูลยอดขาย เมื่อมีออเดอร์แล้วรายงานจะแสดงที่นี่
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 lg:p-6">
          <h2 className="font-semibold text-slate-800 mb-4">
            สัดส่วนตามหมวดหมู่
          </h2>
          {categoriesSold.length > 0 ? (
            <ul className="w-full space-y-2 text-sm">
              {categoriesSold.map(([name, value]) => (
                <li
                  key={name}
                  className="flex justify-between gap-3 text-slate-700"
                >
                  <span>{name}</span>
                  <span className="font-medium">
                    {categoryTotal
                      ? Math.round((value / categoryTotal) * 100)
                      : 0}
                    % · {formatBaht(value)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center text-sm text-slate-500">
              ยังไม่มีข้อมูลสินค้าในรายงาน
            </div>
          )}
        </div>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 p-4 lg:p-6">
        <h2 className="font-semibold text-slate-800 mb-3">รายการออเดอร์</h2>
        <div className="divide-y divide-slate-100">
          {orders.length > 0 ? (
            [...orders].reverse().map((order) => (
              <div key={order.order_id} className="flex flex-wrap items-center gap-3 py-3">
                <button onClick={() => onSelectOrder(order.order_id)} className="flex flex-wrap items-center gap-3 text-left hover:text-blue-700 active:opacity-75 cursor-pointer transition-colors">
                  <span className="font-medium text-slate-800">Order #{order.order_id}</span>
                  <span className="text-sm text-slate-500">{STATUS_LABELS[order.status] || order.status} / {order.payment_status || "PENDING"}</span>
                  <span className="text-sm">{formatBaht(order.total_price)}</span>
                  <span className="text-xs text-slate-500">{formatThaiDateTime(order.order_time)}</span>
                </button>
                {order.status === Object.keys(STATUS_LABELS)[0] && <div className="ml-auto flex gap-2">
                  <button disabled={isSubmitting} onClick={() => onStatusChange(order.order_id, Object.keys(STATUS_LABELS)[2])} className="h-9 px-3 rounded-lg bg-blue-700 text-white text-sm hover:bg-blue-800 active:bg-blue-900 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all">Finish order</button>
                  <button disabled={isSubmitting} onClick={() => window.confirm("Cancel this order and restore its ingredient stock?") && onStatusChange(order.order_id, Object.keys(STATUS_LABELS)[1])} className="h-9 px-3 rounded-lg border border-red-300 text-red-700 text-sm hover:bg-red-50 active:bg-red-100 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all">Cancel order</button>
                </div>}
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-slate-500">
              ยังไม่มีออเดอร์
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
