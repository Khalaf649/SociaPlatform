const express=require('express');
const authController=require('../controller/auth');
const signupValidator=require('../validation/signup');
const router=express.Router();
router.post('/signUp',signupValidator,authController.postSignup);
router.post('/signin',authController.postSignin);
module.exports=router;