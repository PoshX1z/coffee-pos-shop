import React from "react";
import { Icon } from "../ui/Icon.jsx";
import { ProductImage } from "../ui/ProductImage.jsx";
import { formatBaht } from "../../types/pos";

export const MenuList = ({
  menu,
  categories,
  selectedCategory,
  searchQuery,
  menuError,
  onSelectCategory,
  onSearchChange,
  onOpenForm,
  onDeleteMenu,
}) => {
  const filteredProducts = menu.filter((p) => {
    const matchesCat =
      selectedCategory === "ทั้งหมด" || p.category === selectedCategory;
    const matchesQuery = (p.name + p.category)
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการเมนู</h1>
          <p className="text-sm text-slate-500">
            เพิ่ม แก้ไข หรือกำหนดสูตรวัตถุดิบของสินค้า
          </p>
        </div>
        <button
          onClick={() => onOpenForm(null)}
          className="flex items-center justify-center gap-2 px-4 h-11 bg-blue-700 text-white font-medium rounded-xl hover:bg-blue-800 active:bg-blue-900 active:scale-95 cursor-pointer transition-all"
        >
          <Icon name="plus" />
          เพิ่มเมนู
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icon
            name="search"
            className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            placeholder="ค้นหาเมนู..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
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

      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 sm:gap-4 p-3 sm:px-5 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-50 grid place-items-center overflow-hidden shrink-0 transition-transform duration-200 hover:scale-105">
                <ProductImage
                  src={p.imageData}
                  iconClass="w-6 h-6 text-slate-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-xs text-slate-500">{p.category}</div>
                <div
                  className={`text-xs ${
                    p.available ? "text-emerald-700" : "text-slate-500"
                  }`}
                >
                  {p.available
                    ? `ทำได้อีก ${p.maxOrderQuantity} รายการ`
                    : p.ingredients.length
                      ? "วัตถุดิบไม่เพียงพอ"
                      : "ยังไม่ได้กำหนดสูตรวัตถุดิบ"}
                  {p.ingredients.length > 0 &&
                    ` · ${p.ingredients
                      .map(
                        (ing) =>
                          `${ing.name} ${ing.quantityPerItem} ${ing.unit}`,
                      )
                      .join(", ")}`}
                </div>
              </div>
              <div className="w-20 text-sm text-right font-medium">
                {formatBaht(p.price)}
              </div>
              <button
                onClick={() => onOpenForm(p)}
                className="w-9 h-9 grid place-items-center rounded-full hover:bg-slate-100 active:bg-slate-200 active:scale-95 text-slate-600 hover:text-blue-700 cursor-pointer transition-all"
                aria-label="แก้ไข"
              >
                <Icon name="edit" className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteMenu(p.id)}
                className="w-9 h-9 grid place-items-center rounded-full hover:bg-red-50 active:bg-red-100 active:scale-95 text-red-600 hover:text-red-700 cursor-pointer transition-all"
                aria-label="ลบ"
              >
                <Icon name="trash" className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-sm text-slate-500">
            {menuError
              ? `เชื่อมต่อสินค้าไม่ได้: ${menuError}`
              : menu.length
                ? "ไม่พบเมนูที่ค้นหา"
                : "ยังไม่มีสินค้า กรุณากด “เพิ่มเมนู” เพื่อเริ่มต้น"}
          </div>
        )}
      </div>
    </div>
  );
};
