import * as menuModel from "../models/menuModel.js";

const validImageData = (value) => {
  if (value == null || value === "") return true;
  const match =
    typeof value === "string" &&
    value.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
  return Boolean(
    match && Buffer.from(match[2], "base64").length <= 2 * 1024 * 1024,
  );
};

// GET /api/menu
export const getAll = async (req, res) => {
  try {
    const rows = await menuModel.getAllMenus();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ไม่สามารถโหลดข้อมูลเมนูได้" });
  }
};

// GET /api/menu/:id
export const getById = async (req, res) => {
  try {
    const menu = await menuModel.getMenuById(req.params.id);
    if (!menu) {
      return res.status(404).json({ error: "ไม่พบเมนูที่ระบุ" });
    }
    res.json(menu);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ไม่สามารถโหลดข้อมูลเมนูได้" });
  }
};

// GET /api/menu/:id/recipe
export const getRecipe = async (req, res) => {
  try {
    const recipe = await menuModel.getMenuRecipe(req.params.id);
    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ไม่สามารถโหลดสูตรวัตถุดิบได้" });
  }
};

// PUT /api/menu/:id/recipe
export const saveRecipe = async (req, res) => {
  const { ingredients } = req.body;
  if (!Array.isArray(ingredients))
    return res.status(400).json({ error: "กรุณาระบุรายการวัตถุดิบ" });
  const seen = new Set();
  for (const item of ingredients) {
    const ingredientId = Number(item?.ingredientId);
    const quantityPerItem = Number(item?.quantityPerItem);
    if (
      !Number.isInteger(ingredientId) ||
      ingredientId <= 0 ||
      !Number.isFinite(quantityPerItem) ||
      quantityPerItem <= 0 ||
      seen.has(ingredientId)
    ) {
      return res
        .status(400)
        .json({ error: "วัตถุดิบต้องไม่ซ้ำและปริมาณต่อเมนูต้องมากกว่า 0" });
    }
    seen.add(ingredientId);
  }
  try {
    const updated = await menuModel.setMenuRecipe(
      req.params.id,
      ingredients.map((item) => ({
        ingredientId: Number(item.ingredientId),
        quantityPerItem: Number(item.quantityPerItem),
      })),
    );
    if (!updated) return res.status(404).json({ error: "ไม่พบเมนูนี้" });
    res.json({ updated: true });
  } catch (err) {
    console.error(err);
    res
      .status(400)
      .json({ error: err.message || "ไม่สามารถบันทึกสูตรวัตถุดิบได้" });
  }
};

// POST /api/menu
export const create = async (req, res) => {
  const { name, price, category, imageData } = req.body;
  if (!name || typeof price !== "number" || price <= 0 || !category) {
    return res
      .status(400)
      .json({ error: "กรุณาระบุชื่อเมนู หมวดหมู่ และราคาที่มากกว่า 0" });
  }
  if (!validImageData(imageData))
    return res.status(400).json({
      error: "menu image must be PNG, JPG, or WebP and no larger than 2 MB.",
    });
  try {
    const productId = await menuModel.createMenu(
      name,
      price,
      category,
      imageData || null,
    );
    res.status(201).json({ productId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ไม่สามารถเพิ่มเมนูได้" });
  }
};

// PUT /api/menu/:id/recipe
export const update = async (req, res) => {
  const { name, price, category, imageData, removeImage } = req.body;
  if (!validImageData(imageData))
    return res.status(400).json({
      error: "menu image must be PNG, JPG, or WebP and no larger than 2 MB.",
    });
  try {
    const affectedRows = await menuModel.updateMenu(req.params.id, {
      name,
      price,
      category,
      imageData,
      removeImage,
    });
    if (affectedRows === 0) {
      return res.status(404).json({ error: "ไม่พบเมนูที่ระบุ" });
    }
    res.json({ updated: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ไม่สามารถแก้ไขเมนูได้" });
  }
};

export const deleteMenu = async (req, res) => {
  try {
    const affectedRows = await menuModel.deleteMenu(req.params.id);

    if (affectedRows === 0) {
      return res.status(404).json({ error: "ไม่พบเมนูที่ระบุ" });
    }

    res.json({ success: true, message: "ลบเมนูเรียบร้อยแล้ว" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ไม่สามารถลบเมนูได้" });
  }
};
