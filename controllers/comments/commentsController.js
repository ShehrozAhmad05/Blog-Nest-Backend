const asyncHandler = require('express-async-handler');
const Post = require('../../models/Post/Post');
const Comment = require('../../models/Comment/Comment');


const commentsController = {
    //Create  comments
    create: asyncHandler(async (req, res) => {
        //Find the post by id
        const {postId, content} = req.body;
        //Find the post
        const post = await Post.findById(postId);
        //Check if post exists
        if (!post) {
            throw new Error('Post not found');
        }
        //create the comment
        const commentCreated= await Comment.create({
            content,
            author: req.user,
            post: postId
        })
        //push the comment to the post
        post.comments.push(commentCreated?._id);
        //save the post
        await post.save();
        res.json({
            status: 'success',
            message: 'Comment added successfully',
            commentCreated
        });
    }),

    //Delete
    delete: asyncHandler(async (req, res) => {}),

    //Update
    update: asyncHandler(async (req, res) => {})

}

module.exports = commentsController;