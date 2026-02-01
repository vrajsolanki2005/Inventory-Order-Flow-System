USE inventory_system;
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    productname VARCHAR(50) NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    stock BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);
-- adding the new colum of low_stock_threshold if stock value <5 or is_active
ALTER TABLE products 
ADD COLUMN low_stock_threshold BOOLEAN,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

UPDATE products
SET low_stock_threshold = 
    CASE 
        WHEN stock < 5 OR is_active = TRUE THEN TRUE
        ELSE FALSE
    END;
