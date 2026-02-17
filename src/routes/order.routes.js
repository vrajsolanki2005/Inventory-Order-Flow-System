const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const { validateItems } = require('../utils/validator');
const orderController = require('../controllers/order.controller');

router.post('/orders', authenticateToken, validateItems, orderController.createOrder);

module.exports = router;
