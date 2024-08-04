const {body}=require('express-validator');
const User=require('../model/user');
module.exports=[
    body('email').normalizeEmail().notEmpty().withMessage('the email is Required').isEmail().withMessage('Please Enter a valid mail').custom(async(email)=>{
     const user=await User.findOne({email:email});
     if(user)
        throw new Error('the User Already Registered');
    }),
    body('name').trim().isLength({min:5}).withMessage('the minimum is 5'),
    body('password').trim().isLength({min:5}).withMessage('the minimum is 5')

]