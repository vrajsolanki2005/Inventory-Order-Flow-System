const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { validateItems } = require('../utils/validator');

// Create order
router.post('/orders', authenticateToken, validateItems, async (req, res) => {
    try {
        const { items } = req.body;
        const user_id = req.user.id;

        // Validate and fetch product prices
        const productIds = items.map(item => item.product_id);
        const [products] = await db.query('SELECT product_id, price FROM products WHERE product_id IN (?) AND is_active = 1', [productIds]);
        
        if (products.length !== items.length) {
            return res.status(400).json({ message: 'Invalid product(s)' });
        }

        const priceMap = {};
        products.forEach(p => priceMap[p.product_id] = p.price);

        const total_amount = items.reduce((sum, item) => sum + (Number(priceMap[item.product_id]) * Number(item.quantity)), 0);

        const [orderResult] = await db.query('INSERT INTO orders (user_id, total_amount) VALUES (?, ?)', [user_id, total_amount]);
        const order_id = orderResult.insertId;

        const orderItems = items.map(item => [order_id, item.product_id, item.quantity, priceMap[item.product_id]]);
        await db.query('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ?', [orderItems]);

        res.status(201).json({ message: 'Order created successfully', order_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating order' });
    }
});

module.exports = router;
