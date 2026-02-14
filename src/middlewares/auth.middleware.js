const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1] || req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findUserById(decoded.id);
        
        if (!user) {
            console.log('User not found for ID:', decoded.id);
            return res.status(401).json({ message: 'User not found' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.log('JWT verification error:', error.message);
        return res.status(403).json({ message: 'Invalid token: ' + error.message });
    }
};

module.exports = { authenticateToken };