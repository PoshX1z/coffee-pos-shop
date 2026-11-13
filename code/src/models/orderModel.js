import db from "../config/db.js";

export const getAllOrders = async () => {
  const [rows] = await db.query(
    `
    SELECT
      order_id,
      order_time,
      status,
      total_price,
      customer_id,
      cashier_id,
      (SELECT status FROM payments WHERE payments.order_id = orders.order_id LIMIT 1) AS payment_status
    FROM orders
    ORDER BY order_time DESC
    `,
  );
  return rows;
};

export const getOrderById = async (orderId) => {
  const [orderRows] = await db.query(
    `
    SELECT
      o.order_id,
      o.order_time,
      o.status,
      o.total_price,
      o.customer_id,
      o.cashier_id,
      c.name AS customer_name,
      c.phone AS customer_phone
    FROM orders o
    LEFT JOIN customers c ON c.customer_id = o.customer_id
    WHERE o.order_id = ?
    `,
    [orderId],
  );

  if (orderRows.length === 0) return null;

  const [itemRows] = await db.query(
    `
    SELECT
      oi.order_id,
      oi.product_id,
      p.name,
      p.price,
      p.image_data,
      oi.quantity,
      oi.subtotal
    FROM order_items oi
    INNER JOIN products p ON oi.product_id = p.product_id
    WHERE oi.order_id = ?
    `,
    [orderId],
  );

  const [paymentRows] = await db.query(
    `
    SELECT p.payment_id, p.order_id, p.method, p.amount, p.status, r.issue_date AS receipt_date
    FROM payments p
    LEFT JOIN receipts r ON p.payment_id = r.payment_id
    WHERE p.order_id = ?
    `,
    [orderId],
  );

  return {
    ...orderRows[0],
    items: itemRows,
    payment: paymentRows[0] || null,
  };
};

export const findProductById = async (productId, connection) => {
  const [rows] = await connection.query(
    `
    SELECT product_id, name, price, category, image_data
    FROM products
    WHERE product_id = ?
    `,
    [productId],
  );
  return rows[0] || null;
};

export const createCustomer = async (name, phone, connection) => {
  const [result] = await connection.query(
    "INSERT INTO customers (name, phone) VALUES (?, ?)",
    [name, phone],
  );
  return result.insertId;
};

export const createOrderRecord = async (totalPrice, customerId, connection) => {
  const [result] = await connection.query(
    `
    INSERT INTO orders (order_time, status, total_price, customer_id, cashier_id)
    VALUES (NOW(), 'PENDING', ?, ?, NULL)
    `,
    [totalPrice, customerId],
  );
  return result.insertId;
};

export const createPaymentAndReceipt = async (
  orderId,
  method,
  amount,
  connection,
) => {
  const [paymentResult] = await connection.query(
    "INSERT INTO payments (order_id, method, amount, status) VALUES (?, ?, ?, 'PENDING')",
    [orderId, method, amount],
  );
  const paymentId = paymentResult.insertId;

  await connection.query(
    "INSERT INTO receipts (payment_id, issue_date, total_amount) VALUES (?, NOW(), ?)",
    [paymentId, amount],
  );

  return paymentId;
};

export const createOrderItems = async (orderId, items, connection) => {
  for (const item of items) {
    await connection.query(
      `
      INSERT INTO order_items (order_id, product_id, quantity, subtotal)
      VALUES (?, ?, ?, ?)
      `,
      [orderId, item.productId, item.quantity, item.subtotal],
    );
  }
};

export const getOrderStatus = async (orderId, connection) => {
  const [orders] = await connection.query(
    "SELECT status FROM orders WHERE order_id = ? FOR UPDATE",
    [orderId],
  );
  return orders[0] || null;
};

export const getPayment = async (orderId, connection) => {
  const [payments] = await connection.query(
    "SELECT payment_id, method, amount, status FROM payments WHERE order_id = ? FOR UPDATE",
    [orderId],
  );
  return payments[0] || null;
};

export const cancelOrderTransaction = async (orderId, connection) => {
  const [usageRows] = await connection.query(
    "SELECT ingredient_id, quantity_used FROM order_ingredients WHERE order_id = ? FOR UPDATE",
    [orderId],
  );

  for (const usage of usageRows) {
    await connection.query(
      "UPDATE ingredients SET quantity = quantity + ? WHERE ingredient_id = ?",
      [usage.quantity_used, usage.ingredient_id],
    );
  }

  await connection.query(
    "UPDATE payments SET status = 'REFUNDED' WHERE order_id = ?",
    [orderId],
  );

  await connection.query(
    "UPDATE orders SET status = 'CANCELLED' WHERE order_id = ?",
    [orderId],
  );
};

export const completeOrderTransaction = async (
  orderId,
  paymentMethod,
  connection,
) => {
  const [payments] = await connection.query(
    "SELECT payment_id FROM payments WHERE order_id = ? FOR UPDATE",
    [orderId],
  );

  let paymentId;
  if (payments.length) {
    paymentId = payments[0].payment_id;
    await connection.query(
      "UPDATE payments SET status = 'PAID', method = COALESCE(?, method) WHERE payment_id = ?",
      [paymentMethod, paymentId],
    );
  } else {
    const [paymentResult] = await connection.query(
      "INSERT INTO payments (order_id, method, amount, status) SELECT order_id, ?, total_price, 'PAID' FROM orders WHERE order_id = ?",
      [paymentMethod, orderId],
    );
    paymentId = paymentResult.insertId;
  }

  await connection.query(
    `
    INSERT INTO receipts (payment_id, issue_date, total_amount)
    SELECT ?, NOW(), total_price FROM orders WHERE order_id = ?
    ON DUPLICATE KEY UPDATE issue_date = VALUES(issue_date), total_amount = VALUES(total_amount)
    `,
    [paymentId, orderId],
  );

  await connection.query(
    "UPDATE orders SET status = 'SUCCESS' WHERE order_id = ?",
    [orderId],
  );
};
