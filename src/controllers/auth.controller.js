const authService = require('../services/auth.service');

exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        await authService.register(username, email, password);
        res.status(200).json({ message: "User created successfully" });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { token, user } = await authService.login(email, password);
        res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ token, user });
    } catch (error) {
        next(error);
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};
