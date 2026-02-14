const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const { isStrongPassword } = require('../utils/validator');

exports.register = async (username, email, password) => {
    if (!username || !email || !password) {
        throw new ApiError(400, 'Please fill in all fields');
    }
    
    if (!isStrongPassword(password)) {
        throw new ApiError(400, 'Password is not strong. Password must be at least 8 characters and include uppercase, lowercase, number, and special character');
    }
    
    const userExists = await User.findUserByEmail(email);
    if (userExists) {
        throw new ApiError(400, 'User already exists');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword]);
};

exports.login = async (email, password) => {
    if (!email || !password) {
        throw new ApiError(400, 'Please fill in all fields');
    }
    
    const user = await User.findUserByEmail(email);
    if (!user) {
        throw new ApiError(400, 'Invalid credentials');
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new ApiError(400, 'Invalid credentials');
    }
    
    const token = jwt.sign({id: user.user_id}, process.env.JWT_SECRET, {expiresIn: '1d'});
    return { token, user: {id: user.user_id, username: user.username, email: user.email, role: user.role} };
};
