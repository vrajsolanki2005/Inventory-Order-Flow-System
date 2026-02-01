const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
    //create user
    async createUser(userData) {
        const { username, email, password, role } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        if (role) {
            const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
            const values = [username, email, hashedPassword, role];
            const [result] = await db.execute(query, values);
            return result;
        } else {
            const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            const values = [username, email, hashedPassword];
            const [result] = await db.execute(query, values);
            return result;
        }
    },
    //find user by email
    async findUserByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db.execute(query, [email]);
        return rows[0];
    },
    //find user by id
    async findUserById(id) {
        const query = 'SELECT * FROM users WHERE user_id = ?';
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    }
};
module.exports = User;