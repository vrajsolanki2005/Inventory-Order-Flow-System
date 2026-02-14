exports.isStrongPassword = (password) =>{
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

exports.validateProduct = (price, stock, low_stock_threshold) => {
    if (price !== undefined && price <= 0) {
        return { valid: false, message: "Price must be greater than 0" };
    }
    if (stock !== undefined && stock <=0) {
        return { valid: false, message: "Stock cannot be negative" };
    }
    if (low_stock_threshold !== undefined && low_stock_threshold < 0) {
        return { valid: false, message: "Low stock threshold cannot be negative" };
    }
    return { valid: true };
};
