const Post = require('../model/post');
const User = require('../model/user');
const fs=require('fs');
const path=require('path')
const { validationResult } = require('express-validator');
const post = require('../model/post');
const ITEMS_PER_PAGE = 2;
const getIO=require('../socket').getIo
exports.getPosts = async (req, res, next) => {
    try {
        const page = +req.query.page || 1;
        const totalPosts = await Post.countDocuments();
        const posts = await Post.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).populate('creator').sort({createdAt:-1})
        res.status(200).json({
            getPostsByUser:req.user.name,
            message: "Posts Fetched Sucessfully",
            posts,
            totalPosts
        })
    }
    catch (err) {
        if (!err.statusCode)
            err.statusCode = 500;
        next(err);
    }
}



exports.createPost = async (req, res, next) => {
    try {
        const { title, content } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            const error = new Error('validation failed');
            error.statusCode = 422;
            return next(error);
        }
        if (!req.file) {
            const error = new Error('No image provided');
            error.statusCode = 404;
           return next(error);
        }
        const user=req.user;
        if(!user){
            const error = new Error('No user provided');
            error.statusCode = 404;
           return next(error);
        }
        const post = new Post({
            title: title,
            content: content,
            imageUrl: req.file.path,
            creator:user._id 
        })
        await post.save();
        user.posts.push(post._id);
        await user.save();
        const io=getIO();
        io.emit('posts', {
            action: 'create',
            post: {
                ...post._doc,
                creator: {
                    _id: req.user._id,
                    name: req.user.name
                }
            }
        });
        res.status(200).json({
            message: "Post Created Sucessfully",
            post: post
        })

    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);

    }


}
exports.getPost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        if (!postId) {
            const error = new Error('Post Id is not undefined');
            error.statusCode = 404;
            next(error);
        }
        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error('Post is not found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: "Post Fetched Sucessfully",
            post: post
        })

    }
    catch (err) {
        if (!err.statusCode)
            err.statusCode = 500;
        next(err);
    }
}
exports.updatePost = async (req, res, next) => {
    const postId = req.params.postId;
    console.log(postId);
    try {
        if (!postId) {
            const error = new Error('Post Id is not undefined');
            error.statusCode = 404;
            throw err
        }
        let newImage=false;
        let { title, content, imageUrl } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            const error = new Error('validation failed');
            error.statusCode = 422;
            return next(error);
        }
        if (req.file) {
            newImage=true;
            imageUrl = req.file.path;
        }
        if (!imageUrl) {
            const error = new Error('image is not provided');
            err.statusCode=404;
            throw err;

        }
        const post=await Post.findById(postId).populate('creator');
        if(!post){
            const error = new Error('post not found');
            err.statusCode=404;
            throw err; 
        }
     
        if(newImage){
            clearImage(post.imageUrl)
        }
            
        post.title=title;
        post.content=content;
        post.imageUrl=imageUrl;
        await post.save();
        const io=getIO();
        io.emit('post',{
            action:"update",
            post:post

        })
        res.status(200).json({
            message:"posted updated",
            post
        })
    }  catch(err)
    {
        if(!err.statusCode)
            err.statusCode=500;
    }
        
        

}
exports.deletePost=async(req,res,next)=>{
    const postId=req.params.postId;
    if(!postId){
        const error=new Error('No postId');
        err.statusCode=404;
        return next(err);
    }
    const post=await Post.findById(postId);
    if(!post){
        const error=new Error('No Post');
        err.statusCode=404;
        return next(err);
    }
    const user=req.user;
    user.posts.pull(post._id);
    await user.save();
    clearImage(post.imageUrl);
    await Post.findByIdAndDelete(postId);
    const io=getIO();
    io.emit('posts',{
        action:"Delete",
        postId
    })
    res.status(200).json({
        message:"Deleted Sucessfully"
    })
}
const clearImage = (path) => {
  fs.unlink(path, (err) => {
    if (err) {
      console.log("Error deleting file:", err);
    } else {
      console.log("File deleted successfully");
    }
  });
};
