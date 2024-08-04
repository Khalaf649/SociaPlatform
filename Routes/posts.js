const express=require('express');
const router=express.Router();
const postValidator=require('../validation/createPost');
const isAuth=require('../middleware/isAuth');

const PostController=require('../controller/posts');
router.get('/posts',isAuth,PostController.getPosts)
router.post('/post',isAuth,postValidator,PostController.createPost);
router.get('/post/:postId',isAuth,PostController.getPost);
router.put('/post/:postId',isAuth,postValidator,PostController.updatePost);
router.delete('/post/:postId',isAuth,PostController.deletePost);
module.exports=router;