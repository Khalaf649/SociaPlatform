const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');
const User = require('../model/user');
const SECURE_KEY=process.env.SECURE_KEY
exports.postSignup = async (req, res, next) => {
    try {
        const { email, name, password } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation Failed');
            error.statusCode = 422;
            return next(error);
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            name: name,
            email: email,
            posts: [],
            password: hashedPassword
        })
        await user.save();
        res.status(200).json({
            message: "User created",
            user: user
        })

    }
    catch (err) {
        if (!err.statusCode)
            err.statusCode = 500;
        next(err);
    }

}
exports.postSignin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            return next(error);
        }
        const matchPassword = await bcrypt.compare(password, user.password);
        if (!matchPassword) {
            const error = new Error('Password does not match');
            error.statusCode = 401; // 401 for unauthorized
            return next(error);
        }
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                name: user.name
            },
            SECURE_KEY,
            { expiresIn: '1h' }
        );
        const decodedToken = await jwt.verify(token, SECURE_KEY);
        res.status(200).json({
            message: "Signed in successfully",
            token: token
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};