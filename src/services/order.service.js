const db = require('../config/db');

const createOrder = async (userId, items) => {
    const conn = await db.getConnection();
    
    try {
        // START TRANSACTION
        await conn.beginTransaction();

        //  Check stock >= quantity for each item
        for (const item of items) {
            const [products] = await conn.query(
                'SELECT product_id, price, stock FROM products WHERE product_id = ? AND is_active = 1',
                [item.product_id]
            );

            if (products.length === 0) {
                throw new Error(`Product ${item.product_id} not found or inactive`);
            }

            if (products[0].stock < item.quantity) {
                throw new Error(`Insufficient stock for product ${item.product_id}. Available: ${products[0].stock}, Requested: ${item.quantity}`);
            }
        }

        const [products] = await conn.query(
            'SELECT product_id, price FROM products WHERE product_id IN (?) AND is_active = 1',
            [items.map(i => i.product_id)]
        );

        const priceMap = {};
        products.forEach(p => priceMap[p.product_id] = p.price);
        //calculate the total amt of the ordere
        const totalAmount = items.reduce((sum, item) => 
            sum + (Number(priceMap[item.product_id]) * Number(item.quantity)), 0
        );

        //  Create order
        const [orderResult] = await conn.query(
            'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
            [userId, totalAmount, 'CREATED']
        );

        const orderId = orderResult.insertId;

        const orderItems = items.map(item => [
            orderId,
            item.product_id,
            item.quantity,
            priceMap[item.product_id]
        ]);

        //  Insert order_items
        await conn.query(
            'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ?',
            [orderItems]
        );

        //  Reduce stock
        for (const item of items) {
            await conn.query(
                'UPDATE products SET stock = stock - ? WHERE product_id = ?',
                [item.quantity, item.product_id]
            );
        }

        //  COMMIT if everything OK
        await conn.commit();

        return { orderId, totalAmount };

    } catch (error) {
        // ROLLBACK on error
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

const getAllOrders = async (userId, role) => {
    const query = role === 'Admin' 
        ? 'SELECT o.*, u.username FROM orders o JOIN users u ON o.user_id = u.user_id ORDER BY o.created_at DESC'
        : 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC';
    
    const [orders] = role === 'Admin' ? await db.query(query) : await db.query(query, [userId]);
    return orders;
};

const updateOrderStatus = async (orderId, status) => {
    const [result] = await db.query(
        'UPDATE orders SET status = ? WHERE order_id = ?',
        [status, orderId]
    );
    if (result.affectedRows === 0) throw new Error('Order not found');
};

const cancelOrder = async (orderId, userId, role) => {
    const conn = await db.getConnection();
    
    try {
        await conn.beginTransaction();

        const [orders] = await conn.query(
            'SELECT status, user_id FROM orders WHERE order_id = ?',
            [orderId]
        );

        if (orders.length === 0) throw new Error('Order not found');
        
        const order = orders[0];
        
        if (role !== 'Admin' && order.user_id != userId) {
            throw new Error('Unauthorized');
        }

        if (order.status === 'SHIPPED') {
            throw new Error('Cannot cancel shipped orders');
        }

        if (order.status === 'CANCELLED') {
            throw new Error('Order already cancelled');
        }

        const [orderItems] = await conn.query(
            'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
            [orderId]
        );

        for (const item of orderItems) {
            await conn.query(
                'UPDATE products SET stock = stock + ? WHERE product_id = ?',
                [item.quantity, item.product_id]
            );
        }

        await conn.query(
            'UPDATE orders SET status = ? WHERE order_id = ?',
            ['CANCELLED', orderId]
        );

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

const updateOrderQuantity = async (orderId, userId, role, items) => {
    const conn = await db.getConnection();
    
    try {
        await conn.beginTransaction();

        const [orders] = await conn.query(
            'SELECT status, user_id FROM orders WHERE order_id = ?',
            [orderId]
        );

        if (orders.length === 0) throw new Error('Order not found');
        
        const order = orders[0];
        
        if (role !== 'admin' && order.user_id != userId) {
            throw new Error('Unauthorized');
        }

        if (order.status !== 'CREATED') {
            throw new Error('Only CREATED orders can be updated');
        }

        const [oldItems] = await conn.query(
            'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
            [orderId]
        );

        for (const oldItem of oldItems) {
            await conn.query(
                'UPDATE products SET stock = stock + ? WHERE product_id = ?',
                [oldItem.quantity, oldItem.product_id]
            );
        }

        for (const item of items) {
            const [products] = await conn.query(
                'SELECT price, stock FROM products WHERE product_id = ? AND is_active = 1',
                [item.product_id]
            );

            if (products.length === 0) {
                throw new Error(`Product ${item.product_id} not found`);
            }

            if (products[0].stock < item.quantity) {
                throw new Error(`Insufficient stock for product ${item.product_id}`);
            }
        }

        await conn.query('DELETE FROM order_items WHERE order_id = ?', [orderId]);

        const [products] = await conn.query(
            'SELECT product_id, price FROM products WHERE product_id IN (?)',
            [items.map(i => i.product_id)]
        );

        const priceMap = {};
        products.forEach(p => priceMap[p.product_id] = p.price);

        const totalAmount = items.reduce((sum, item) => 
            sum + (Number(priceMap[item.product_id]) * Number(item.quantity)), 0
        );

        const orderItems = items.map(item => [
            orderId,
            item.product_id,
            item.quantity,
            priceMap[item.product_id]
        ]);

        await conn.query(
            'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ?',
            [orderItems]
        );

        for (const item of items) {
            await conn.query(
                'UPDATE products SET stock = stock - ? WHERE product_id = ?',
                [item.quantity, item.product_id]
            );
        }

        await conn.query(
            'UPDATE orders SET total_amount = ? WHERE order_id = ?',
            [totalAmount, orderId]
        );

        await conn.commit();
        return { totalAmount };
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

module.exports = { createOrder, getAllOrders, updateOrderStatus, cancelOrder, updateOrderQuantity };
