const orderService = require('../services/order.service');

const createOrder = async (req, res) => {
    try {
        const { items } = req.body;
        const userId = req.user.user_id;

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

const getAllOrders = async (req, res) => {
    try {
        const orders = await orderService.getAllOrders();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await orderService.updateOrderStatus(req.params.id, status);
        res.json({ message: 'Order status updated' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const cancelOrder = async (req, res) => {
    try {
        await orderService.cancelOrder(req.params.id, req.user.user_id, req.user.role);
        res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateOrderQuantity = async (req, res) => {
    try {
        const { items } = req.body;
        const result = await orderService.updateOrderQuantity(req.params.id, req.user.user_id, req.user.role, items);
        res.json({ message: 'Order updated successfully', total_amount: result.totalAmount });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getUserOrders = async (req, res) => {
    try {
        const orders = await orderService.getUserOrders(req.params.userId, req.user.user_id, req.user.role);
        res.json(orders);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { createOrder, getAllOrders, updateOrderStatus, cancelOrder, updateOrderQuantity, getUserOrders };
