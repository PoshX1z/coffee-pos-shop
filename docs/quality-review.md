# รายงานผลการตรวจสอบคุณภาพและความปลอดภัยของซอฟต์แวร์ (wk14-quality-review.md)
> **รายวิชา:** การวิเคราะห์และออกแบบระบบ (System Analysis and Design) — สัปดาห์ที่ 14  
> **โครงงาน:** ระบบจัดการร้านกาแฟ (Cafe POS System)  
> **กลุ่มพัฒนา:** WeLoveCookierun  

---

## 1. บทนำและวัตถุประสงค์ (Introduction & Objective)

การตรวจสอบคุณภาพและความปลอดภัยของซอฟต์แวร์ในสัปดาห์ที่ 14 เป็นการประเมินโค้ดจริงที่พัฒนาขึ้นตลอดทั้งภาคการศึกษา (Retrofit Code Review) โดยมุ่งเน้นการตรวจสอบว่าระบบมีความพร้อม ทนทานต่อการใช้งานผิดวัตถุประสงค์ (Misuse) และปลอดภัยจากช่องโหว่พื้นฐานตามมาตรฐานหรือไม่ แตกต่างจากการทดสอบ End-to-End (E2E Testing) ในสัปดาห์ที่ 13 ที่เน้นเพียงความถูกต้องตามเส้นทางการทำงานปกติ (Happy Path)

การตรวจสอบนี้อ้างอิงจาก **Code Review Checklist 5 ข้อสำหรับระบบ CRUD** ตามข้อกำหนดของสัปดาห์ที่ 14:
1. **Input Validation:** ตรวจสอบชนิด รูปแบบ และความถูกต้องของข้อมูลนำเข้าครบทุก Endpoint
2. **การป้องกัน Insecure Direct Object Reference (IDOR):** การตรวจสอบสิทธิ์การเข้าถึงข้อมูลตามบทบาทหรือขอบเขตสาขา
3. **การป้องกัน SQL Injection:** การใช้ Parameterized Query (`?` placeholder) สม่ำเสมอทุกจุด
4. **ความสอดคล้องของ Error Handling:** มี `try/catch` ครอบคลุมและไม่เปิดเผย Internal SQL Error ออกไปสู่ภายนอก
5. **การป้องกัน Race Condition:** การจัดการ Concurrency ในจุดที่มีการอ่านแล้วเขียนข้อมูลต่อเนื่อง (Check-then-Act) ด้วย Database Transaction และ Row Locking

---

## 2. รายการ Endpoint ทั้งหมดและผลการตรวจสอบเทียบกับ Checklist

รวบรวม Endpoint ทั้งหมดจากไฟล์ Routes ของระบบ (`orderRoutes.js`, `menuRoutes.js`, `ingredientRoutes.js`, `salesReportRoutes.js`) ได้ผลการตรวจดังตารางต่อไปนี้:

| Endpoint (Method & Path) | หน้าที่การทำงาน | 1. Validation | 2. IDOR | 3. SQL Injection | 4. Error Handling | 5. Race Condition | ผลการประเมินโดยรวม |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `POST /api/orders` | บันทึกรายการสั่งซื้อและตัดสต็อก | ผ่าน | ผ่าน* | ผ่าน | ผ่าน | ผ่าน | ผ่านสมบูรณ์ |
| `GET /api/orders` | ดึงรายการออเดอร์ทั้งหมด | ผ่าน | ผ่าน* | ผ่าน | ผ่าน | ผ่าน | ผ่านสมบูรณ์ |
| `GET /api/orders/:id` | ดูรายละเอียดออเดอร์และใบเสร็จ | ผ่าน | ผ่าน* | ผ่าน | ผ่าน | ผ่าน | ผ่านสมบูรณ์ |
| `PATCH /api/orders/:id/status` | อัปเดตสถานะออเดอร์ / ชำระเงิน / คืนสต็อก | ผ่าน | ผ่าน* | ผ่าน | ผ่าน | ผ่าน | ผ่านสมบูรณ์ |
| `POST /api/orders/:id/payment/success` | ยืนยันชำระเงินสำเร็จหน้า POS | ผ่าน | ผ่าน* | ผ่าน | ผ่าน | ผ่าน | ผ่านสมบูรณ์ |
| `GET /api/menu` | แสดงรายการเมนูและคำนวณจำนวนที่ทำได้ | ผ่าน | ผ่าน | ผ่าน | ผ่าน | ผ่าน | ผ่านสมบูรณ์ |
| `GET /api/menu/:id` | ดึงข้อมูลเมนูรายชิ้น | ผ่าน | ผ่าน | ผ่าน | ผ่าน | ผ่าน | ผ่านสมบูรณ์ |
| `GET /api/menu/:id/recipe` | ดึงสูตรวัตถุดิบของเมนู | ผ่าน | ผ่าน | ผ่าน | ผ่าน | ผ่าน | ผ่านสมบูรณ์ |
| `POST /api/menu` | เพิ่มรายการเมนูใหม่ | ผ่าน | ผ่าน | ผ่าน | ผ่าน | ผ่าน | ผ่านสมบูรณ์ |
| `PUT /api/menu/:id` | แก้ไขข้อมูลเมนู (ชื่อ, ราคา, หมวดหมู่, รูปภาพ) | ผ่าน | ผ่าน | ผ่าน | ผ่าน | ผ่าน | ผ่านสมบูรณ์ |
| `PUT /api/menu/:id/recipe` | บันทึก/แก้ไขสูตรวัตถุดิบของเมนู | ผ่าน | ผ่าน | ผ่าน | ผ่าน | ผ่าน | ผ่านสมบูรณ์ |
| `GET /api/ingredients` | ดึงรายการสต็อกวัตถุดิบทั้งหมด | ผ่าน | ผ่าน | ผ่าน | ผ่าน | ผ่าน | ผ่านสมบูรณ์ |
| `POST /api/ingredients` | เพิ่มวัตถุดิบใหม่เข้าคลัง | ผ่าน | ผ่าน | ผ่าน | ผ่าน | ผ่าน | ผ่านสมบูรณ์ |
| `PUT /api/ingredients/:id` | อัปเดตสต็อกหรือค่าการแจ้งเตือนวัตถุดิบ | ผ่าน | ผ่าน | ผ่าน | ผ่าน | ผ่าน | ผ่านสมบูรณ์ |
| `GET /api/reports/sales` | สรุปรายงานยอดขายแยกตามสินค้า | ผ่าน | ผ่าน | ผ่าน | ผ่าน | ผ่าน | ผ่านสมบูรณ์ |

*\*หมายเหตุเกี่ยวกับ IDOR:* ปัจจุบันระบบออกแบบเป็นแบบ Single Store Deployment ใช้งานภายในร้านสาขาเดียว ข้อมูลออเดอร์และสินค้าจึงอยู่ในบริบทของร้านเดียวกัน

---

## 3. การวิเคราะห์จุดความเสี่ยงที่พบและการจัดการ (Risk Findings & Analysis)

### 3.1 จุดความเสี่ยงที่ 1: การเกิด Race Condition ในการตัดสต็อกวัตถุดิบ (Concurrency Control)
- **ระดับความรุนแรง:** High (ความเสี่ยงสูง)
- **บริบทของปัญหา:**  
  ในระบบร้านกาแฟที่มีลูกค้าสั่งซื้อพร้อมกันหลายเครื่องหรือมีพนักงานแคชเชียร์หลายจุด หากระบบตรวจสอบปริมาณสต็อกวัตถุดิบ (`SELECT quantity`) แล้วแยกคำสั่งตัดสต็อก (`UPDATE ingredients`) ในเวลาถัดมาโดยไม่มีการล็อกข้อมูล อาจทำให้คำสั่งซื้อทั้งสองเห็นสต็อกว่ามีเพียงพอพร้อมกัน ส่งผลให้สต็อกติดลบหรือรับออเดอร์เกินกว่าวัตถุดิบที่มีจริง
- **การจัดการของระบบเรา:**  
  ระบบได้ครอบกระบวนการสั่งซื้อทั้งหมดไว้ภายใน **Database Transaction (`beginTransaction`, `commit`, `rollback`)** พร้อมทั้งใช้คำสั่ง **`SELECT ... FOR UPDATE`** ในฟังก์ชันการตรวจสอบสูตรและสต็อกวัตถุดิบ (`findRecipeForProducts`) เพื่อล็อกแถวข้อมูลวัตถุดิบที่เกี่ยวข้องทันที ทำให้คำขออื่นต้องรอคิวจนกว่าคำสั่งซื้อแรกจะเสร็จสิ้น จึงป้องกันปัญหาสต็อกติดลบได้อย่างสมบูรณ์

### 3.2 จุดความเสี่ยงที่ 2: การป้องกัน SQL Injection
- **ระดับความรุนแรง:** Critical (ความเสี่ยงวิกฤตหากเกิดขึ้น)
- **การจัดการของระบบเรา:**  
  ระบบใช้ไลบรารี `mysql2/promise` และบังคับใช้ **Parameterized Queries (Placeholder `?`)** ในทุกจุดที่มีการส่งค่าตัวแปรจากฝั่งผู้ใช้งาน ไม่มีการต่อสตริง SQL โดยตรง (`String Concatenation`) หรือใช้ Template Literals ในคำสั่ง SQL ทำให้ไม่เปิดช่องโหว่ SQL Injection แม้จะมีการกรอกอักขระพิเศษเข้ามาก็ตาม

### 3.3 จุดความเสี่ยงที่ 3: Input Validation และความปลอดภัยของภาพเมนู
- **ระดับความรุนแรง:** Medium (ปานกลาง)
- **การจัดการของระบบเรา:**  
  - มีการตรวจสอบชนิดข้อมูล (`Type Checking`), ตรวจสอบค่าว่าง (`Empty String`), และค่าตัวเลขที่เป็นบวก (`Positive Number`)
  - ในส่วนของการอัปโหลดภาพสินค้า ได้สร้างฟังก์ชัน `validImageData` ตรวจสอบรูปแบบ Base64 และจำกัดขนาดของไฟล์รูปภาพไว้ไม่เกิน 2 MB เพื่อป้องกันปัญหา Denial of Service (DoS) หรือการส่ง Payload ขนาดใหญ่เกินไปมาที่เซิร์ฟเวอร์

### 3.4 จุดความเสี่ยงที่ 4: Error Handling และ Data Leakage
- **ระดับความรุนแรง:** Low (ความเสี่ยงต่ำ)
- **การจัดการของระบบเรา:**  
  ทุก Controller ครอบคลุมด้วยบล็อก `try...catch` และคืนค่ารหัสสถานะ HTTP ที่เหมาะสม เช่น `400 Bad Request`, `404 Not Found`, `409 Conflict`, และ `500 Internal Server Error` โดยแสดงข้อความแจ้งเตือนภาษาไทยที่กระชับและไม่เปิดเผย Database Internal Error ออกไป

---

## 4. รายละเอียดการปรับปรุงและตัวอย่างโค้ด (Implemented Improvements)

### ตัวอย่าง: การใช้ Database Transaction ร่วมกับ `SELECT ... FOR UPDATE` เพื่อป้องกัน Race Condition ใน `createOrder`

```javascript
// โค้ดที่ปลอดภัย: มีการเปิด Transaction และล็อกแถวข้อมูลวัตถุดิบด้วย FOR UPDATE
const connection = await db.getConnection();
try {
  await connection.beginTransaction();

  // 1. ล็อกและอ่านข้อมูลวัตถุดิบตามสูตรของสินค้า
  const recipeRows = await ingredientModel.findRecipeForProducts(
    [...new Set(productIds)],
    connection, // มีคำสั่ง SELECT ... FOR UPDATE ภายในฟังก์ชัน
  );

  // 2. ตรวจสอบปริมาณว่าเพียงพอหรือไม่
  for (const [ingredientId, info] of requiredByIngredientId) {
    if (info.needed > info.available) {
      await connection.rollback();
      return res.status(400).json({
        error: `วัตถุดิบ ${info.name} ไม่เพียงพอ กรุณาตรวจสอบสต็อกอีกครั้ง`,
      });
    }
  }

  // 3. บันทึกคำสั่งซื้อและการชำระเงิน
  const [orderResult] = await connection.query(
    "INSERT INTO orders (order_time, status, total_price, customer_id) VALUES (NOW(), ?, ?, ?)",
    ["PENDING", totalPrice, customerId],
  );

  // 4. ตัดสต็อกวัตถุดิบ
  for (const [ingredientId, info] of requiredByIngredientId) {
    await ingredientModel.recordUsage(orderId, ingredientId, info.needed, connection);
    await ingredientModel.deductStock(ingredientId, info.needed, connection);
  }

  // 5. บันทึกสำเร็จทั้งหมดพร้อมกัน
  await connection.commit();
} catch (err) {
  await connection.rollback();
  throw err;
} finally {
  connection.release();
}
```

---

## 5. แผนการพัฒนาเพิ่มเติมสำหรับอนาคต (Future Security & Quality Roadmap)

| หัวข้อการปรับปรุง | รายละเอียดและแนวทางในอนาคต | ระดับความสำคัญ |
|---|---|:---:|
| **Authentication & Authorization** | เพิ่มระบบยืนยันตัวตน (เช่น JWT หรือ Session) สำหรับแยกสิทธิ์ระหว่างผู้จัดการร้าน แคชเชียร์ และบาริสต้า | Medium |
| **Multi-Branch Isolation (IDOR)** | หากมีการขยายระบบรองรับหลายสาขาในอนาคต ให้เพิ่ม `branch_id` ในทุกตารางและกรองสิทธิ์การเข้าถึงควบคู่กับ ID เสมอ | Medium |
| **Automated Security Scanning** | ติดตั้ง `eslint-plugin-security` และรัน `npm audit` ใน CI/CD Pipeline เพื่อตรวจสอบช่องโหว่ของ Dependencies สม่ำเสมอ | Low |

---

## 6. สรุปผลการตรวจสอบ (Conclusion)

ผลการตรวจสอบคุณภาพโค้ดของระบบ Cafe POS ในสัปดาห์ที่ 14 พบว่า โครงสร้างของระบบมีความรัดกุม ปลอดภัย และมีคุณภาพตามเกณฑ์มาตรฐาน:
1. การเข้าถึงฐานข้อมูลมีความปลอดภัยจาก SQL Injection 100% ด้วยการใช้ Parameterized Queries
2. จุดวิกฤตที่มีการตัดสต็อกวัตถุดิบได้รับการปกป้องจากปัญหา Race Condition ด้วย Database Transaction และ Row-level Locking (`FOR UPDATE`)
3. มีการตรวจสอบข้อมูลนำเข้าและจัดการข้อผิดพลาด (Error Handling) อย่างเป็นระบบ ช่วยให้แอปพลิเคชันทำงานได้อย่างเสถียรและพร้อมสำหรับการส่งมอบโครงงาน
