// Role middleware
//admin can only add/edit products
const isAdmin = (req, res, next) => {
    //check if user exists (should be set by auth middleware)
    if (!req.user) {
        return res.status(401).json({message: 'Authentication required'});
    }
    
    //check if user is admin
    if(req.user.role !== 'admin'){
        return res.status(403).json({message: 'Access denied: Admins only'});
    }
    
    next();
}

module.exports = { isAdmin };