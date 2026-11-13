import db from "../config/db.js";

export const getAllSalesReport = async (connection = db) => {
  const [rows] = await connection.query(
    `SELECT p.product_id AS productId,
            p.name,
            SUM(oi.quantity) AS totalQuantity,
            SUM(oi.subtotal) AS totalSales
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.order_id
     JOIN products p ON oi.product_id = p.product_id
     WHERE o.status <> 'CANCELLED'
     GROUP BY p.product_id, p.name
     ORDER BY totalSales DESC`,
  );

  return rows;
};
