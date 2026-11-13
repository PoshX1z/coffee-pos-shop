import React from "react";
import { Icon } from "../ui/Icon.jsx";
import { ProductImage } from "../ui/ProductImage.jsx";
import { formatBaht } from "../../types/pos";

export const PosGrid = ({
  menu,
  categories,
  selectedCategory,
  searchQuery,
  cart,
  menuError,
  onSelectCategory,
  onSearchChange,
  onAddToCart,
}) => {
  const filteredProducts = menu.filter((p) => {
    const matchesCat =
      selectedCategory === "ทั้งหมด" || p.category === selectedCategory;
    const matchesQuery = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-4 min-w-0">
      <div className="flex gap-2">
        <label className="flex-1 flex items-center gap-2 h-11 px-3 rounded-xl bg-white border border-slate-200 focus-within:border-slate-500">
          <Icon name="search" className="w-5 h-5 text-slate-400" />
          <input
            type="search"
            placeholder="ค้นหาเมนู..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
          />
        </label>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["ทั้งหมด", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-4 h-9 rounded-full border text-sm whitespace-nowrap cursor-pointer transition-all active:scale-95 ${
              selectedCategory === cat
                ? "bg-blue-700 border-slate-800 text-white hover:bg-blue-800"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 active:bg-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p) => {
            const remaining = p.maxOrderQuantity - (cart[p.id] || 0);
            const unavailable = remaining <= 0;
            const reason = !p.ingredients.length
              ? "ยังไม่ได้กำหนดสูตรวัตถุดิบ"
              : p.maxOrderQuantity === 0
                ? "วัตถุดิบไม่เพียงพอ"
                : "เลือกครบจำนวนที่วัตถุดิบรองรับแล้ว";

            return (
              <button
                key={p.id}
                disabled={unavailable}
                onClick={() => onAddToCart(p.id)}
                className={`group text-left p-2 rounded-xl border transition-all duration-200 ${
                  unavailable
                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-white border-slate-200 hover:scale-105 hover:shadow-lg hover:border-blue-300 cursor-pointer active:scale-95"
                }`}
              >
                <div
                  className={`aspect-[4/3] rounded-lg overflow-hidden ${
                    unavailable ? "bg-slate-200" : "bg-blue-50"
                  } grid place-items-center`}
                >
                  <div className="w-full h-full transition-transform duration-200 group-hover:scale-105 grid place-items-center">
                    <ProductImage
                      src={p.imageData}
                      iconClass="w-7 h-7 text-slate-300"
                    />
                  </div>
                </div>
                <div className="mt-2 px-1 text-sm font-medium truncate">
                  {p.name}
                </div>
                <div
                  className={`px-1 pb-1 text-sm ${
                    unavailable ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {formatBaht(p.price)}
                </div>
                {unavailable ? (
                  <div className="mx-1 mb-1 rounded-lg bg-slate-200 px-2 py-1 text-xs text-slate-600">
                    {reason}
                  </div>
                ) : (
                  <div className="px-1 pb-1 text-xs text-slate-500">
                    ทำได้อีก {remaining} รายการ
                  </div>
                )}
              </button>
            );
          })
        ) : (
          <div className="col-span-full py-12 px-4 text-center text-sm text-slate-500">
            {menuError
              ? `เชื่อมต่อสินค้าไม่ได้: ${menuError}`
              : menu.length
                ? "ไม่พบเมนูที่ค้นหา"
                : "ยังไม่มีสินค้า กรุณาเพิ่มสินค้าในหน้าเมนู"}
          </div>
        )}
      </div>
    </div>
  );
};
