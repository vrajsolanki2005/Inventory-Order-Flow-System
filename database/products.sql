USE inventory_system;
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    productname VARCHAR(50) NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    stock BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);