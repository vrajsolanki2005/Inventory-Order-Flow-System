const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');
const { validateItems } = require('../utils/validator');
const orderController = require('../controllers/order.controller');

router.post('/orders', authenticateToken, validateItems, orderController.createOrder);
router.get('/orders', authenticateToken, orderController.getAllOrders);
router.put('/orders/:id', authenticateToken, validateItems, orderController.updateOrderQuantity);
router.put('/orders/:id/status', authenticateToken, isAdmin, orderController.updateOrderStatus);
router.delete('/orders/:id', authenticateToken, orderController.cancelOrder);

module.exports = router;
