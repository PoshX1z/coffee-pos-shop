CREATE DATABASE IF NOT EXISTS coffee_pos
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE coffee_pos;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS sales_records;
DROP TABLE IF EXISTS sales_reports;
DROP TABLE IF EXISTS recipe_items;
DROP TABLE IF EXISTS order_ingredients;
DROP TABLE IF EXISTS receipts;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS employees;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE employees (
employee_id VARCHAR(20) NOT NULL,
name VARCHAR(100) NOT NULL,
username VARCHAR(50) NOT NULL,
password VARCHAR(255) NOT NULL,
role VARCHAR(30) NOT NULL,

PRIMARY KEY (employee_id),
UNIQUE KEY uk_employees_username (username),

CONSTRAINT chk_employees_role
    CHECK (
        role IN (
            'CASHIER',
            'BARISTA',
            'MANAGER',
            'ADMINISTRATOR'
        )
    )
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- 2. Customers (Standalone table with AUTO_INCREMENT customer_id and optional name/phone)
CREATE TABLE customers (
customer_id INT NOT NULL AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
phone VARCHAR(20) NULL,

PRIMARY KEY (customer_id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- 3. Products
CREATE TABLE products (
product_id INT NOT NULL AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
price DECIMAL(10,2) NOT NULL,
category VARCHAR(50) NOT NULL,
image_data MEDIUMTEXT NULL,
is_active TINYINT(1) NOT NULL DEFAULT 1,

PRIMARY KEY (product_id),

CONSTRAINT chk_products_price
    CHECK (price >= 0)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- 4. Ingredients
CREATE TABLE ingredients (
ingredient_id INT NOT NULL AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
quantity DECIMAL(10,2) NOT NULL,
unit VARCHAR(20) NOT NULL,
min_threshold DECIMAL(10,2) NOT NULL,

PRIMARY KEY (ingredient_id),

CONSTRAINT chk_ingredients_quantity
    CHECK (quantity >= 0),

CONSTRAINT chk_ingredients_threshold
    CHECK (min_threshold >= 0)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- 5. Orders (Updated customer_id foreign key reference and made customer_id NULLABLE for walk-in guest orders)
CREATE TABLE orders (
order_id INT NOT NULL AUTO_INCREMENT,
order_time DATETIME NOT NULL,
status VARCHAR(30) NOT NULL,
total_price DECIMAL(10,2) NOT NULL,
customer_id INT NULL,
cashier_id VARCHAR(20) NULL,

PRIMARY KEY (order_id),

CONSTRAINT fk_orders_customer
    FOREIGN KEY (customer_id)
    REFERENCES customers(customer_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

CONSTRAINT fk_orders_cashier
    FOREIGN KEY (cashier_id)
    REFERENCES employees(employee_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

CONSTRAINT chk_orders_total_price
    CHECK (total_price >= 0),

CONSTRAINT chk_orders_status
    CHECK (
        status IN (
            'PENDING',
            'CANCELLED',
            'SUCCESS'
        )
    )
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS recipe_items (
  product_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  qty_per_unit DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (product_id, ingredient_id),
  CONSTRAINT fk_recipe_items_product
    FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_recipe_items_ingredient
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_recipe_items_quantity CHECK (qty_per_unit > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Order Items
CREATE TABLE order_items (
order_id INT NOT NULL,
product_id INT NOT NULL,
quantity INT NOT NULL,
subtotal DECIMAL(10,2) NOT NULL,

PRIMARY KEY (order_id, product_id),

CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id)
    REFERENCES orders(order_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id)
    REFERENCES products(product_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

CONSTRAINT chk_order_items_quantity
    CHECK (quantity > 0),

CONSTRAINT chk_order_items_subtotal
    CHECK (subtotal >= 0)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- 7. Payments
CREATE TABLE payments (
payment_id INT NOT NULL AUTO_INCREMENT,
order_id INT NOT NULL,
method VARCHAR(30) NOT NULL,
amount DECIMAL(10,2) NOT NULL,
status VARCHAR(30) NOT NULL,

PRIMARY KEY (payment_id),
UNIQUE KEY uk_payments_order_id (order_id),

CONSTRAINT fk_payments_order
    FOREIGN KEY (order_id)
    REFERENCES orders(order_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

CONSTRAINT chk_payments_amount
    CHECK (amount >= 0),

CONSTRAINT chk_payments_method
    CHECK (
        method IN (
            'CASH',
            'CARD',
            'QR',
            'TRANSFER'
        )
    ),

CONSTRAINT chk_payments_status
    CHECK (
        status IN (
            'PENDING',
            'PAID',
            'FAILED',
            'REFUNDED'
        )
    )
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- 8. Receipts
CREATE TABLE receipts (
receipt_id INT NOT NULL AUTO_INCREMENT,
payment_id INT NOT NULL,
issue_date DATETIME NOT NULL,
total_amount DECIMAL(10,2) NOT NULL,

PRIMARY KEY (receipt_id),
UNIQUE KEY uk_receipts_payment_id (payment_id),

CONSTRAINT fk_receipts_payment
    FOREIGN KEY (payment_id)
    REFERENCES payments(payment_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

CONSTRAINT chk_receipts_total_amount
    CHECK (total_amount >= 0)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- 9. Order Ingredients
CREATE TABLE order_ingredients (
order_id INT NOT NULL,
ingredient_id INT NOT NULL,
quantity_used DECIMAL(10,2) NOT NULL,

PRIMARY KEY (order_id, ingredient_id),

CONSTRAINT fk_order_ingredients_order
    FOREIGN KEY (order_id)
    REFERENCES orders(order_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

CONSTRAINT fk_order_ingredients_ingredient
    FOREIGN KEY (ingredient_id)
    REFERENCES ingredients(ingredient_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

CONSTRAINT chk_order_ingredients_quantity
    CHECK (quantity_used > 0)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- 10. Sales Reports
CREATE TABLE sales_reports (
report_type VARCHAR(30) NOT NULL,

PRIMARY KEY (report_type),

CONSTRAINT chk_sales_reports_type
    CHECK (
        report_type IN (
            'DAILY',
            'MONTHLY'
        )
    )
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- 11. Sales Records
CREATE TABLE sales_records (
report_type VARCHAR(30) NOT NULL,
date DATE NOT NULL,
total_sales DECIMAL(12,2) NOT NULL,

PRIMARY KEY (report_type, date),

CONSTRAINT fk_sales_records_report
    FOREIGN KEY (report_type)
    REFERENCES sales_reports(report_type)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

CONSTRAINT chk_sales_records_total_sales
    CHECK (total_sales >= 0)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
