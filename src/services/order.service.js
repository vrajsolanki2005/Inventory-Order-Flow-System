const db = require('../config/db');

const createOrder = async (userId, items) => {
    const conn = await db.getconn();
    
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

module.exports = { createOrder };
