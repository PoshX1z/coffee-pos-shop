import { Icon } from "../ui/Icon.jsx";

const formatQuantity = (value) =>
  Number(value || 0).toLocaleString("th-TH", { maximumFractionDigits: 2 });

export const IngredientList = ({
  ingredients,
  onOpenIngredientForm,
  onDeleteIngredient,
}) => (
  <div className="space-y-4">
    <div className="flex flex-col justify-between gap-4 sm:flex-row">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">วัตถุดิบ</h1>
        <p className="text-sm text-slate-500">
          สต็อกวัตถุดิบ และแจ้งเตือนเมื่อวัตถุดิบใกล้หมด
        </p>
      </div>
      <button
        onClick={() => onOpenIngredientForm(null)}
        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 font-medium text-white hover:bg-blue-800 active:bg-blue-900 active:scale-95 cursor-pointer transition-all"
      >
        <Icon name="plus" />
        เพิ่มวัตถุดิบ
      </button>
    </div>

    <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
      {ingredients.length ? (
        ingredients.map((ingredient) => {
          const quantity = Number(ingredient.quantity || 0);
          const threshold = Number(ingredient.min_threshold || 0);
          const outOfStock = quantity <= 0;
          const runningLow = !outOfStock && quantity < threshold;

          return (
            <div
              key={ingredient.ingredient_id}
              className="flex flex-wrap items-center gap-3 p-4"
            >
              <div className="min-w-40 flex-1">
                <div className="flex flex-wrap items-center gap-2 font-medium text-slate-800">
                  {ingredient.name}
                  {outOfStock ? (
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
                      วัตถุดิบหมด
                    </span>
                  ) : runningLow ? (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      ใกล้หมด
                    </span>
                  ) : null}
                </div>
                <div className="text-sm text-slate-500">
                  คงเหลือ{" "}
                  <span className="text-green-500 font-semibold">
                    {" "}
                    {formatQuantity(quantity)}
                  </span>{" "}
                  แจ้งเตือนเมื่อต่ำกว่า {""}
                  <span className="text-red-500 font-semibold">
                    {formatQuantity(threshold)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onOpenIngredientForm(ingredient)}
                  className="h-9 rounded-lg border border-slate-300 px-3 text-sm text-slate-700 hover:bg-slate-100 active:bg-slate-200 active:scale-95 cursor-pointer transition-all"
                >
                  แก้ไข
                </button>
                {/* <button
                  onClick={() => onDeleteIngredient(ingredient.ingredient_id)}
                  className="h-9 rounded-lg border border-red-200 px-3 text-sm text-red-700 hover:bg-red-50 active:bg-red-100 active:scale-95 cursor-pointer transition-all"
                >
                  ลบ
                </button> */}
              </div>
            </div>
          );
        })
      ) : (
        <div className="p-8 text-center text-sm text-slate-500">
          ยังไม่มีวัตถุดิบ กรุณาเพิ่มวัตถุดิบ
        </div>
      )}
    </div>
  </div>
);
