import * as reportModel from "../models/reportModel.js";

// GET /api/reports/sales
export const getAll = async (_req, res) => {
  try {
    const reportData = await reportModel.getAllSalesReport();
    return res.json(reportData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to retrieve sales report" });
  }
};
