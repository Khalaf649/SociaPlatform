const mongoose = require('mongoose');
const { Schema } = mongoose;
const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: "Post",
    }],
    status: {
        type: String,
        default: "i am new"
    }
}, { timestamps: true })

userSchema.methods.addPost = async function (postId) {
    this.posts.push(postId);
    await this.save();
}

userSchema.methods.deletePost = async function (postId) {
    this.posts.pull(postId);
    await this.save();

}
module.exports = mongoose.model('User', userSchema)