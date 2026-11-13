export const TABS = [
  { key: "order", label: "รับออเดอร์", icon: "cart" },
  { key: "menu", label: "เมนู", icon: "menu" },
  { key: "ingredient", label: "วัตถุดิบ", icon: "bag" },
  { key: "report", label: "รายงาน", icon: "chart" },
];

export const STATUS_LABELS = {
  PENDING: "กำลังดำเนินการ",
  CANCELLED: "ยกเลิก",
  SUCCESS: "สำเร็จ",
};

export const PAYMENT_LABELS = {
  CASH: "เงินสด",
  CARD: "บัตรเครดิต",
  QR: "คิวอาร์โค้ด",
  TRANSFER: "โอนธนาคาร",
};

export const PAYMENT_STATUS_LABELS = {
  PENDING: "รอชำระเงิน",
  PAID: "ชำระแล้ว",
  REFUNDED: "คืนเงินแล้ว",
  FAILED: "ไม่สำเร็จ",
};

export const formatBaht = (value) =>
  `฿${Number(value || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}`;

export const formatThaiDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value ?? "-");
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map(({ type, value: part }) => [type, part]),
  );
  return `${parts.day} ${parts.month} ${parts.year} · เวลา ${parts.hour}:${parts.minute} น.`;
};

export const normalizeProduct = (p) => ({
  id: p.product_id ?? p.productId ?? p.id,
  name: p.name,
  category: p.category,
  price: Number(p.price),
  imageData: p.image_data || p.imageData || "",
  active: true,
  ingredients: p.ingredients || [],
  maxOrderQuantity: Number(p.maxOrderQuantity || 0),
  available: Boolean(p.available),
});
