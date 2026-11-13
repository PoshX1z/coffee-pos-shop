import { useState, useEffect } from "react";

export const MenuModal = ({
  isOpen,
  product,
  ingredients,
  categories,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [imageData, setImageData] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState([]);
  const [recipeQuantities, setRecipeQuantities] = useState({});

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setCategory(product.category || "");
      setPrice(product.price || "");
      setImageData(product.imageData || "");
      setRemoveImage(false);
      const selected = (product.ingredients || []).map((i) =>
        Number(i.ingredientId),
      );
      setSelectedIngredientIds(selected);
      setRecipeQuantities(
        Object.fromEntries(
          (product.ingredients || []).map((i) => [
            i.ingredientId,
            String(i.quantityPerItem),
          ]),
        ),
      );
    } else {
      setName("");
      setCategory("");
      setPrice("");
      setImageData("");
      setRemoveImage(false);
      setSelectedIngredientIds([]);
      setRecipeQuantities({});
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleIngredientSelection = (e) => {
    const selected = [...e.target.selectedOptions].map((opt) =>
      Number(opt.value),
    );
    setSelectedIngredientIds(selected);
    setRecipeQuantities((prev) => {
      const updated = { ...prev };
      selected.forEach((id) => {
        if (!updated[id]) updated[id] = "1";
      });
      return updated;
    });
  };

  const handleQuantityChange = (id, value) => {
    setRecipeQuantities((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      event.target.value = "";
      window.alert("Choose a PNG, JPG, or WebP image under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageData(String(reader.result || ""));
      setRemoveImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const recipe = selectedIngredientIds.map((id) => ({
      ingredientId: id,
      quantityPerItem: Number(recipeQuantities[id] || 1),
    }));

    onSubmit({
      id: product?.id,
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      imageData,
      removeImage,
      recipe,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 grid place-items-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full max-h-[90dvh] overflow-y-auto overscroll-contain p-5">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          {product ? "แก้ไขเมนู" : "เพิ่มเมนู"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              ชื่อเมนู
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
                หมวดหมู่
              </label>
              <input
                type="text"
                list="categoryList"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm"
              />
              <datalist id="categoryList">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                ราคา (บาท)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <section className="space-y-2 rounded-xl border border-dashed border-slate-300 p-3">
            <label
              htmlFor="menu-image"
              className="block text-xs font-medium text-slate-600"
            >
              Menu image
            </label>
            <div className="relative grid aspect-video place-items-center overflow-hidden rounded-lg bg-slate-100">
              {imageData ? (
                <img
                  src={imageData}
                  alt="Menu preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm text-slate-500">
                  No image selected
                </span>
              )}
            </div>
            <input
              id="menu-image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-blue-700 file:cursor-pointer hover:file:bg-blue-100 active:file:bg-blue-200 file:transition-colors"
            />
            <p className="text-xs text-slate-500">
              PNG, JPG, or WebP up to 2 MB
            </p>
            {imageData && (
              <button
                type="button"
                onClick={() => {
                  setImageData("");
                  setRemoveImage(Boolean(product));
                }}
                className="text-sm text-red-700 hover:text-red-800 hover:underline cursor-pointer active:opacity-75 transition-colors"
              >
                Remove image
              </button>
            )}
          </section>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              เลือกวัตถุดิบที่ใช้ทำ(กด Ctrl/Cmd เพื่อเลือกหลายรายการ)
            </label>
            <select
              multiple
              value={selectedIngredientIds.map(String)}
              onChange={handleIngredientSelection}
              className="w-full h-28 border border-slate-200 rounded-xl p-2 text-sm"
            >
              {ingredients.map((ing) => (
                <option key={ing.ingredient_id} value={ing.ingredient_id}>
                  {ing.name} จำนวน {ing.quantity} ปริมาณ {ing.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedIngredientIds.map((id) => {
              const ing = ingredients.find(
                (item) => Number(item.ingredient_id) === id,
              );
              return (
                <label
                  key={id}
                  className="flex items-center gap-2 rounded-lg bg-blue-50 p-2 text-sm"
                >
                  <span className="flex-1 text-slate-700">
                    {ing?.name || "วัตถุดิบ"} ({ing?.unit || ""})
                  </span>
                  <span className="text-xs text-slate-500">ใช้ต่อเมนู</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={recipeQuantities[id] || "1"}
                    onChange={(e) => handleQuantityChange(id, e.target.value)}
                    className="w-24 rounded-lg border border-slate-200 px-2 py-1 bg-white text-sm"
                  />
                </label>
              );
            })}
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
