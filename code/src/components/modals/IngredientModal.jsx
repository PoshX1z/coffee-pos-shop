import { useState, useEffect } from "react";

export const IngredientModal = ({ isOpen, ingredient, onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [minThreshold, setMinThreshold] = useState("");

  useEffect(() => {
    if (ingredient) {
      setName(ingredient.name || "");
      setQuantity(ingredient.quantity ?? "");
      setUnit(ingredient.unit || "");
      setMinThreshold(ingredient.min_threshold ?? "");
    } else {
      setName("");
      setQuantity("");
      setUnit("");
      setMinThreshold("");
    }
  }, [ingredient, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ingredientId: ingredient?.ingredient_id,
      name: name.trim(),
      quantity: Number(quantity),
      unit: unit.trim(),
      minThreshold: Number(minThreshold),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 grid place-items-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          {ingredient ? "แก้ไขวัตถุดิบ" : "เพิ่มวัตถุดิบ"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              ชื่อวัตถุดิบ
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                จำนวนคงเหลือ
              </label>
              <input
                type="number"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                หน่วย
              </label>
              <input
                type="text"
                required
                placeholder="เช่น กรัม, มล., ชิ้น"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              แจ้งเตือนเมื่อขั้นต่ำน้อยกว่า
            </label>
            <input
              type="number"
              required
              value={minThreshold}
              onChange={(e) => setMinThreshold(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm"
            />
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
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
