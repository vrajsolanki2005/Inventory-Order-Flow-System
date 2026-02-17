const orderService = require('../services/order.service');

const createOrder = async (req, res) => {
    try {
        const { items } = req.body;
        const userId = req.user.id;

        const result = await orderService.createOrder(userId, items);

        res.status(201).json({
            message: 'Order created successfully',
            order_id: result.orderId,
            total_amount: result.totalAmount
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(400).json({ message: error.message });
    }
};

module.exports = { createOrder };
