// Product routes
const express = require('express');
const router = express.Router();
// const Product = require('../models/productModel');
const db = require('../config/db');
const {isAdmin} = require('../middlewares/role.middleware');
const {authenticateToken} = require('../middlewares/auth.middleware');
const {validateProduct} = require('../utils/validator');

//GET ALL PRODUCTS
router.get('/products', async(req, res) => {
    try{
        //fetch data from db
        const [products] = await db.query("SELECT productname, sku, price, stock FROM products WHERE is_active = true");
        res.status(200).json({message: "Products fetched successfully", data: products});
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: 'Error fetching products'});
    }
})

//GET PRODUCTS BY ID
router.get('/products/:id', async(req, res) => {
    try{
        const {id} = req.params;
        //fetch data from db
        const [product] = await db.query("SELECT productname, sku, price, stock FROM products WHERE product_id = ? AND is_active = true", [id]);
        res.status(200).json({message: "Product fetched successfully", data: product[0]});
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: 'Error fetching product'});
    }
})
//CREATE PRODUCT ONLY BY ADMIN
router.post('/product', authenticateToken, isAdmin, async(req, res) => {
    try{
        const { productname, sku, price, stock, low_stock_threshold } = req.body;
        
        if (!productname || !sku || price == null) {
            return res.status(400).json({ message: "Missing required product fields" });
        }

        const validation = validateProduct(price, stock, low_stock_threshold);
        if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
        }

        const query = `
            INSERT INTO products (productname, sku, price, stock, low_stock_threshold, is_active) 
            VALUES (?, ?, ?, ?, ?, true)
        `;
        await db.query(query, [productname, sku, price, stock, low_stock_threshold]);
        res.status(200).json({message: "Product created successfully"});
    }
    catch(error){
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "SKU already exists" });
        }
        console.error(error);
        res.status(500).json({ message: 'Error creating product' });
    }
})

//UPDATE THE PRODUCTS
router.put('/products/:id', authenticateToken, isAdmin, async(req, res) => {
    try{
        const {id} = req.params;
        const { productname, sku, price, stock, low_stock_threshold } = req.body;

        const validation = validateProduct(price, stock, low_stock_threshold);
        if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
        }

        // Build dynamic query based on provided fields
        const updates = [];
        const values = [];
        
        if (productname !== undefined) {
            updates.push('productname = ?');
            values.push(productname);
        }
        if (sku !== undefined) {
            updates.push('sku = ?');
            values.push(sku);
        }
        if (price !== undefined) {
            updates.push('price = ?');
            values.push(price);
        }
        if (stock !== undefined) {
            updates.push('stock = ?');
            values.push(stock);
        }
        if (low_stock_threshold !== undefined) {
            updates.push('low_stock_threshold = ?');
            values.push(low_stock_threshold);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }
        
        values.push(id);
        const query = `UPDATE products SET ${updates.join(', ')} WHERE product_id = ? AND is_active = true`;
        
        const [result] = await db.query(query, values);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        res.status(200).json({message: "Product updated successfully"});
    }
    catch(error){
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "SKU already exists" });
        }
        console.error('Update error:', error);
        res.status(500).json({ message: 'Error updating product: ' + error.message });
    }
})

//DELETE THE PRODUCTS
router.delete('/products/:id', authenticateToken, isAdmin, async(req, res) => {
    try{
        const {id} = req.params;
        const query = "UPDATE products SET is_active = false WHERE product_id = ?";
        await db.query(query, [id]);
        res.status(200).json({message: "Product deleted successfully"});
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: 'Error deleting product'});
    }
});

module.exports = router;