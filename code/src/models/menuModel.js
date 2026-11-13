import db from "../config/db.js";

export const getAllMenus = async () => {
  const [products] = await db.query(
    "SELECT product_id, name, price, category, image_data FROM products WHERE is_active = 1 ORDER BY name",
  );

  const [recipes] = await db.query(
    `SELECT ri.product_id, i.ingredient_id, i.name AS ingredient_name, i.unit, i.quantity AS stock, ri.qty_per_unit
     FROM recipe_items ri 
     JOIN ingredients i ON i.ingredient_id = ri.ingredient_id
     ORDER BY ri.product_id, i.name`,
  );

  const recipesByProduct = new Map();
  for (const row of recipes) {
    const list = recipesByProduct.get(row.product_id) || [];
    list.push({
      ingredientId: row.ingredient_id,
      name: row.ingredient_name,
      unit: row.unit,
      stock: Number(row.stock),
      quantityPerItem: Number(row.qty_per_unit),
    });
    recipesByProduct.set(row.product_id, list);
  }

  return products.map((product) => {
    const ingredients = recipesByProduct.get(product.product_id) || [];
    const maxOrderQuantity = ingredients.length
      ? Math.min(
          ...ingredients.map((item) =>
            Math.floor((item.stock + 0.000001) / item.quantityPerItem),
          ),
        )
      : 0;

    return {
      ...product,
      ingredients,
      maxOrderQuantity,
      available: maxOrderQuantity > 0,
    };
  });
};

export const getMenuById = async (product_id) => {
  const [rows] = await db.query(
    `SELECT product_id, name, price, category, image_data
     FROM products
     WHERE product_id = ?`,
    [product_id],
  );

  return rows[0];
};
export const getMenuRecipe = async (productId) => {
  const [rows] = await db.query(
    `SELECT ingredient_id AS ingredientId, qty_per_unit AS quantityPerItem
     FROM recipe_items 
     WHERE product_id = ? 
     ORDER BY ingredient_id`,
    [productId],
  );

  return rows.map((row) => ({
    ingredientId: Number(row.ingredientId),
    quantityPerItem: Number(row.quantityPerItem),
  }));
};

export const setMenuRecipe = async (productId, ingredients) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [product] = await connection.query(
      "SELECT product_id FROM products WHERE product_id = ? FOR UPDATE",
      [productId],
    );

    if (!product.length) {
      await connection.rollback();
      return false;
    }

    const ids = ingredients.map((item) => item.ingredientId);
    if (ids.length) {
      const [found] = await connection.query(
        "SELECT ingredient_id FROM ingredients WHERE ingredient_id IN (?)",
        [ids],
      );
      if (found.length !== new Set(ids).size) {
        await connection.rollback();
        throw new Error("หนึ่งในวัตถุดิบที่เลือกไม่มีอยู่ในระบบ");
      }
    }

    await connection.query("DELETE FROM recipe_items WHERE product_id = ?", [
      productId,
    ]);

    for (const item of ingredients) {
      await connection.query(
        "INSERT INTO recipe_items (product_id, ingredient_id, qty_per_unit) VALUES (?, ?, ?)",
        [productId, item.ingredientId, item.quantityPerItem],
      );
    }

    await connection.commit();
    return true;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

export const createMenu = async (name, price, category, imageData) => {
  const [result] = await db.query(
    "INSERT INTO products (name, price, category, image_data) VALUES (?, ?, ?, ?)",
    [name, price, category, imageData],
  );

  return result.insertId;
};

export const updateMenu = async (
  product_id,
  { name, price, category, imageData, removeImage },
) => {
  const [result] = await db.query(
    `UPDATE products
     SET name = COALESCE(?, name),
         price = COALESCE(?, price),
         category = COALESCE(?, category),
         image_data = CASE WHEN ? THEN NULL WHEN ? IS NOT NULL THEN ? ELSE image_data END
     WHERE product_id = ?`,
    [
      name ?? null,
      price ?? null,
      category ?? null,
      removeImage ? 1 : 0,
      imageData ?? null,
      imageData ?? null,
      product_id,
    ],
  );

  return result.affectedRows;
};

export const deleteMenu = async (product_id) => {
  const [result] = await db.query(
    "UPDATE products SET is_active = 0 WHERE product_id = ?",
    [product_id],
  );

  return result.affectedRows;
};
