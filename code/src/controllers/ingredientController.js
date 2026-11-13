import * as ingredientModel from "../models/ingredientModel.js";

// GET /api/ingredients
export const getAll = async (_req, res) => {
  try {
    const ingredients = await ingredientModel.getAllIngredients();
    res.json(ingredients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ไม่สามารถโหลดข้อมูลวัตถุดิบได้" });
  }
};

// POST /api/ingredients
export const create = async (req, res) => {
  const { name, quantity, unit, minThreshold } = req.body;

  if (
    !String(name || "").trim() ||
    !String(unit || "").trim() ||
    !Number.isFinite(Number(quantity)) ||
    Number(quantity) < 0 ||
    !Number.isFinite(Number(minThreshold)) ||
    Number(minThreshold) < 0
  ) {
    return res.status(400).json({
      error: "กรุณากรอกชื่อ หน่วย จำนวน และระดับแจ้งเตือน โดยจำนวนต้องไม่ติดลบ",
    });
  }

  try {
    const ingredientId = await ingredientModel.createIngredient(
      String(name).trim(),
      Number(quantity),
      String(unit).trim(),
      Number(minThreshold),
    );
    res.status(201).json({ ingredientId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ไม่สามารถเพิ่มวัตถุดิบได้" });
  }
};

// PUT /api/ingredients/:id
export const update = async (req, res) => {
  const ingredientId = Number(req.params.id);
  const { name, quantity, unit, minThreshold } = req.body;

  if (
    !Number.isInteger(ingredientId) ||
    ingredientId <= 0 ||
    !String(name || "").trim() ||
    !String(unit || "").trim() ||
    !Number.isFinite(Number(quantity)) ||
    Number(quantity) < 0 ||
    !Number.isFinite(Number(minThreshold)) ||
    Number(minThreshold) < 0
  ) {
    return res.status(400).json({
      error: "กรุณากรอกชื่อ หน่วย จำนวน และระดับแจ้งเตือน โดยจำนวนต้องไม่ติดลบ",
    });
  }

  try {
    const affectedRows = await ingredientModel.updateIngredient(
      ingredientId,
      String(name).trim(),
      Number(quantity),
      String(unit).trim(),
      Number(minThreshold),
    );

    if (!affectedRows) {
      const existing = await ingredientModel.getIngredientById(ingredientId);
      if (!existing) {
        return res.status(404).json({ error: "ไม่พบวัตถุดิบที่ต้องการแก้ไข" });
      }
    }

    res.json({ updated: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ไม่สามารถแก้ไขวัตถุดิบได้" });
  }
};

// DELETE /api/ingredients/:id
/*
export const delete = async (req, res) => {
  const ingredientId = Number(req.params.id);

  if (!Number.isInteger(ingredientId) || ingredientId <= 0) {
    return res.status(400).json({ error: "รหัสวัตถุดิบไม่ถูกต้อง" });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const ingredient = await ingredientModel.getIngredientById(
      ingredientId,
      connection,
    );

    if (!ingredient) {
      await connection.rollback();
      return res.status(404).json({ error: "ไม่พบวัตถุดิบที่ต้องการลบ" });
    }

    const linkedProductIds = await ingredientModel.getLinkedMenuProductIds(
      ingredientId,
      connection,
    );

    for (const productId of linkedProductIds) {
      await ingredientModel.deleteRecipeItemsByProductId(productId, connection);
    }

    await ingredientModel.deleteIngredient(ingredientId, connection);

    await connection.commit();
    res.json({ deleted: true, affectedMenus: linkedProductIds.length });
  } catch (err) {
    await connection.rollback();
    if (
      err.code === "ER_ROW_IS_REFERENCED_2" ||
      err.code === "ER_NO_REFERENCED_ROW_2"
    ) {
      return res.status(409).json({
        error: "ลบวัตถุดิบนี้ไม่ได้ เพราะมีประวัติการใช้งานในออเดอร์แล้ว",
      });
    }
    console.error(err);
    res.status(500).json({ error: "ไม่สามารถลบวัตถุดิบได้" });
  } finally {
    connection.release();
  }
};
*/
