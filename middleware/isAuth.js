const jwt = require('jsonwebtoken');
const SECURE_KEY = "SECRET PASSWORD";
const User=require('../model/user');

module.exports = async (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new Error('Not Authenticated');
        error.statusCode = 401;
        return next(error);
    }


    try {
        const token = authHeader.split(' ')[1];
        const decodedToken = await jwt.verify(token, SECURE_KEY);
        req.user=await User.findById(decodedToken.userId);
      
        next();
    } catch (err) {
        err.statusCode = 401;
        return next(err);
    }
};
