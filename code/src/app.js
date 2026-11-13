import "dotenv/config";
import express from "express";
import orderRoutes from "./routes/orderRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import salesReportRoutes from "./routes/salesReportRoutes.js";
import ingredientRoutes from "./routes/ingredientRoutes.js";
const app = express();

app.use(express.json({ limit: "3mb" }));
app.use("/api/orders", orderRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/reports/sales", salesReportRoutes);
app.use("/api/ingredients", ingredientRoutes);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Coffee POS Backend is running at port ${PORT}`);
});

export default app;
