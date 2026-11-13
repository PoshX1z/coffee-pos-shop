import db from "../config/db.js";

export const getAllIngredients = async () => {
  const [rows] = await db.query(
    "SELECT ingredient_id, name, quantity, unit, min_threshold FROM ingredients ORDER BY name",
  );
  return rows;
};

export const getIngredientById = async (ingredientId, connection = db) => {
  const [rows] = await connection.query(
    "SELECT ingredient_id FROM ingredients WHERE ingredient_id = ?",
    [ingredientId],
  );
  return rows[0];
};

export const createIngredient = async (name, quantity, unit, minThreshold) => {
  const [result] = await db.query(
    "INSERT INTO ingredients (name, quantity, unit, min_threshold) VALUES (?, ?, ?, ?)",
    [name, quantity, unit, minThreshold],
  );
  return result.insertId;
};

export const updateIngredient = async (
  ingredientId,
  name,
  quantity,
  unit,
  minThreshold,
) => {
  const [result] = await db.query(
    "UPDATE ingredients SET name = ?, quantity = ?, unit = ?, min_threshold = ? WHERE ingredient_id = ?",
    [name, quantity, unit, minThreshold, ingredientId],
  );
  return result.affectedRows;
};

export const getLinkedMenuProductIds = async (
  ingredientId,
  connection = db,
) => {
  const [rows] = await connection.query(
    // find ingredient_id that link to product
    "SELECT DISTINCT product_id FROM recipe_items WHERE ingredient_id = ?",
    [ingredientId],
  );
  return rows.map((row) => row.product_id);
};
/*
export const deleteRecipeItemsByProductId = async (
  productId,
  connection = db,
) => {
  await connection.query("DELETE FROM recipe_items WHERE product_id = ?", [
    productId,
  ]);
};
*/

/*
export const deleteIngredient = async (ingredientId, connection = db) => {
  const [result] = await connection.query(
    "DELETE FROM ingredients WHERE ingredient_id = ?",
    [ingredientId],
  );
  return result.affectedRows;
};
*/
export const findRecipeForProducts = async (productIds, connection = db) => {
  if (!productIds || productIds.length === 0) return [];

  // look for the ingredient required for recipe in product, also check the quantity
  const [rows] = await connection.query(
    `SELECT ri.product_id, ri.ingredient_id, ri.qty_per_unit,
            i.quantity, i.min_threshold, i.name AS ingredient_name
     FROM recipe_items ri
     INNER JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
     WHERE ri.product_id IN (?)
     FOR UPDATE`,
    [productIds],
  );
  return rows;
};

export const deductStock = async (
  ingredientId,
  quantityUsed,
  connection = db,
) => {
  await connection.query(
    "UPDATE ingredients SET quantity = quantity - ? WHERE ingredient_id = ?",
    [quantityUsed, ingredientId],
  );
};

export const recordUsage = async (
  orderId,
  ingredientId,
  quantityUsed,
  connection = db,
) => {
  await connection.query(
    "INSERT INTO order_ingredients (order_id, ingredient_id, quantity_used) VALUES (?, ?, ?)",
    [orderId, ingredientId, quantityUsed],
  );
};
