import db from "../config/db.js";
import * as orderModel from "../models/orderModel.js";
import * as ingredientModel from "../models/ingredientModel.js";

// GET /api/orders
export const getAll = async (_req, res) => {
  try {
    const orders = await orderModel.getAllOrders();
    return res.json(orders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "ไม่สามารถโหลดรายการออเดอร์ได้" });
  }
};
// GET /api/orders/:id
export const getById = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await orderModel.getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: "ไม่พบออเดอร์นี้" });
    }
    return res.json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "ไม่สามารถโหลดรายการออเดอร์ได้" });
  }
};

// POST /api/orders
export const create = async (req, res) => {
  const { items, customerName, customerPhone, paymentMethod } = req.body;

  const cleanName = String(customerName || "").trim();
  const cleanPhone = String(customerPhone || "").trim();

  if (!cleanName || !cleanPhone) {
    return res
      .status(400)
      .json({ error: "กรุณากรอกชื่อลูกค้าและเบอร์โทรศัพท์" });
  }

  const allowedPaymentMethods = ["CASH", "CARD", "QR", "TRANSFER"];
  if (!allowedPaymentMethods.includes(paymentMethod)) {
    return res.status(400).json({ error: "กรุณาเลือกวิธีชำระเงิน" });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "กรุณาเลือกเมนูอย่างน้อย 1 รายการ" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    let totalPrice = 0;
    const orderItems = [];
    const productIds = [];

    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(productId) ||
        productId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        await connection.rollback();
        return res.status(400).json({ error: "จำนวนสินค้าต้องมากกว่า 0" });
      }

      const product = await orderModel.findProductById(productId, connection);

      if (!product) {
        await connection.rollback();
        return res.status(404).json({ error: "ไม่พบเมนูที่เลือก" });
      }

      const subtotal = Number(product.price) * quantity;
      totalPrice += subtotal;
      productIds.push(product.product_id);

      orderItems.push({
        productId: product.product_id,
        name: product.name,
        price: Number(product.price),
        quantity,
        subtotal,
        imageData: product.image_data,
      });
    }

    const recipeRows = await ingredientModel.findRecipeForProducts(
      [...new Set(productIds)],
      connection,
    );

    const productsWithoutRecipe = orderItems.filter(
      (item) =>
        !recipeRows.some((recipe) => recipe.product_id === item.productId),
    );

    if (productsWithoutRecipe.length) {
      await connection.rollback();
      return res.status(400).json({
        error: `เมนู ${productsWithoutRecipe[0].name} ยังไม่ได้กำหนดสูตรวัตถุดิบ`,
      });
    }

    const requiredByIngredientId = new Map();
    for (const item of orderItems) {
      const rowsForProduct = recipeRows.filter(
        (r) => r.product_id === item.productId,
      );
      for (const r of rowsForProduct) {
        const quantityNeeded = Number(r.qty_per_unit) * item.quantity;
        const existing = requiredByIngredientId.get(r.ingredient_id);
        if (existing) {
          existing.quantityNeeded += quantityNeeded;
        } else {
          requiredByIngredientId.set(r.ingredient_id, {
            quantityNeeded,
            quantityAvailable: Number(r.quantity),
            minThreshold: Number(r.min_threshold),
            name: r.ingredient_name,
          });
        }
      }
    }

    for (const [, info] of requiredByIngredientId) {
      if (info.quantityNeeded > info.quantityAvailable) {
        await connection.rollback();
        return res.status(400).json({
          error: `วัตถุดิบ ${info.name} ไม่เพียงพอ กรุณาตรวจสอบสต็อกอีกครั้ง`,
        });
      }
    }

    const customerId = await orderModel.createCustomer(
      cleanName,
      cleanPhone,
      connection,
    );
    const orderId = await orderModel.createOrderRecord(
      totalPrice,
      customerId,
      connection,
    );
    const paymentId = await orderModel.createPaymentAndReceipt(
      orderId,
      paymentMethod,
      totalPrice,
      connection,
    );

    await orderModel.createOrderItems(orderId, orderItems, connection);

    const lowStockIngredientIds = [];
    for (const [ingredientId, info] of requiredByIngredientId) {
      await ingredientModel.recordUsage(
        orderId,
        ingredientId,
        info.quantityNeeded,
        connection,
      );
      await ingredientModel.deductStock(
        ingredientId,
        info.quantityNeeded,
        connection,
      );

      if (info.quantityAvailable - info.quantityNeeded < info.minThreshold) {
        lowStockIngredientIds.push(ingredientId);
      }
    }

    await connection.commit();

    if (lowStockIngredientIds.length > 0) {
      console.warn("วัตถุดิบใกล้หมด ingredient_id:", lowStockIngredientIds);
    }

    return res.status(201).json({
      message: "บันทึกออเดอร์สำเร็จ",
      orderId,
      status: "PENDING",
      orderTime: new Date(),
      customerId,
      customerName: cleanName,
      customerPhone: cleanPhone,
      totalPrice,
      lowStockIngredientIds,
      payment: {
        paymentId,
        method: paymentMethod,
        amount: totalPrice,
        status: "PENDING",
      },
      items: orderItems.map((item) => ({
        productId: item.productId,
        product_id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
        image_data: item.imageData,
      })),
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({
      error: "ไม่สามารถบันทึกออเดอร์ได้",
      detail: err.message,
    });
  } finally {
    connection.release();
  }
};

// PATCH /api/orders/:id/status
export const updateStatus = async (req, res) => {
  const orderId = Number(req.params.id);
  let { status } = req.body || {};
  const paymentMethod = req.body?.paymentMethod;

  if (req.body?.paymentSuccess) status = "SUCCESS";

  const allowedStatuses = ["SUCCESS", "CANCELLED"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "สถานะออเดอร์ไม่ถูกต้อง" });
  }

  const allowedPaymentMethods = ["CASH", "CARD", "QR", "TRANSFER"];

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const existingOrder = await orderModel.getOrderStatus(orderId, connection);

    if (!existingOrder) {
      await connection.rollback();
      return res.status(404).json({ error: "ไม่พบออเดอร์นี้" });
    }

    if (existingOrder.status !== "PENDING") {
      await connection.rollback();
      return res.status(409).json({ error: "ออเดอร์นี้เปลี่ยนสถานะไปแล้ว" });
    }

    if (status === "CANCELLED") {
      await orderModel.cancelOrderTransaction(orderId, connection);
    } else {
      if (paymentMethod && !allowedPaymentMethods.includes(paymentMethod)) {
        await connection.rollback();
        return res.status(400).json({
          error: "วิธีชำระเงินไม่ถูกต้อง",
        });
      }

      const existingPayment = await orderModel.getPayment(orderId, connection);

      const effectivePaymentMethod = paymentMethod || existingPayment?.method;

      if (
        !effectivePaymentMethod ||
        !allowedPaymentMethods.includes(effectivePaymentMethod)
      ) {
        await connection.rollback();
        return res.status(400).json({
          error: "ไม่พบวิธีชำระเงิน กรุณาเลือกวิธีชำระเงินก่อนปิดออเดอร์",
        });
      }

      await orderModel.completeOrderTransaction(
        orderId,
        effectivePaymentMethod,
        connection,
      );
    }

    await connection.commit();
    return res.json({ orderId, status, stockRestored: status === "CANCELLED" });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({ error: "ไม่สามารถเปลี่ยนสถานะออเดอร์ได้" });
  } finally {
    connection.release();
  }
};
