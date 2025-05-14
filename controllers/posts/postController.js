const asyncHandler = require('express-async-handler');
const Post = require('../../models/Post/Post');
const Category = require('../../models/Category/Category');
const User = require('../../models/User/User');
const Notification = require('../../models/Notification/Notification');
const sendNotificationMsg = require('../../utils/sendNotificationMsg');

const postController = {
    //Create a post
    createPost: asyncHandler(async (req, res) => {
        //console.log(req.file);
        const { description, category } = req.body;
        //find the category 
        const categoryFound = await Category.findById(category);
        if (!categoryFound) {
            throw new Error('Category not found');
        }
        //find the user 
        const userFound = await User.findById(req.user).populate('posts').populate('plan');
        if (!userFound) {
            throw new Error('User not found');
        }

        //Check Free Plan Post Limit (max 10 posts)
        if (userFound.plan && userFound.plan.planName === 'Free' && userFound.posts.length >= 10) {
            return res.status(403).json({
                status: 'error',
                message: 'Free plan allows a maximum of 10 posts. Please upgrade to a premium plan to continue.',
            });
        }
        //console.log(userFound.plan.planName)

        const postCreated = await Post.create({ description, image: req.file, author: req.user, category });
        //push the post to the category
        categoryFound.posts.push(categoryFound?._id);
        //save the category
        await categoryFound.save();

        //push the post to the user
        userFound.posts.push(postCreated?._id);
        //Update the user account type
        userFound.updateAccountType();
        //save the user
        await userFound.save();
        //Create notification for the user
        await Notification.create({
            userId: req.user,
            postId: postCreated._id,
            message: `New post created by ${userFound.username}`,
        })

        //send the email to his/her followers
        userFound.followers.forEach(async (follower) => {
            //find users by id
            const users = await User.find({ _id: follower });
            //loop through the users and send email
            users.forEach((user) => {
                //send email to the follower
                sendNotificationMsg(user.email, postCreated._id)
            })
        })

        res.json({
            status: 'success',
            message: 'Post created successfully',
            postCreated
        });
    }),
    //List all posts
    fetchAllPosts: asyncHandler(async (req, res) => {
        const { category, title, page = 1, limit = 10 } = req.query;
        //Basic filtering
        let filter = {}
        if (category) {
            filter.category = category;
        }
        if (title) {
            filter.description = { $regex: title, $options: 'i' };
        }
        const posts = await Post.find(filter)
            .populate('category')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit).limit(limit)
        //total number of posts
        const totalPosts = await Post.countDocuments(filter);

        res.status(200).json({
            status: 'success',
            message: 'Posts fetched successfully',
            posts,
            currentPage: page,
            perPage: limit,
            totalPages: Math.ceil(totalPosts / limit),
        });

    }),
    //Get a Post
    getPost: asyncHandler(async (req, res) => {

        const postId = req.params.postId;
        //check for login user
        const userId = req.user ? req.user : null;
        const postFound = await Post.findById(postId).populate({
            path: 'comments',
            populate: {
                path: 'author',
            }
        });
        if (!postFound) {
            throw new Error('Post not found');
        }
        if (userId) {
            await Post.findByIdAndUpdate(postId, {
                $addToSet: { viewers: userId },
                //$inc: { viewsCount: 1},
            }, {
                new: true,
            })
            // //check if the user has already viewed the post
            // if (!postFound?.viewers?.includes(userId)) {
            //     //add the user to the viewers array
            //     postFound.viewers.push(userId);
            //     postFound.viewsCount = postFound?.viewsCount + 1;
            //     //save the post
            //     await postFound.save();
            // }
        }
        res.status(200).json({
            status: 'success',
            postFound
        });

    }),
    //Delete a Post
    delete: asyncHandler(async (req, res) => {

        const postId = req.params.postId;
        const postFound = await Post.findById(postId);
        if (!postFound) {
            return res.status(404).json({
                status: 'fail',
                message: 'Post not found'
            });
        }
        await Post.findByIdAndDelete(postId);
        res.status(200).json({
            status: 'success',
            message: 'Post deleted successfully'
        });
    }),

    //Update a post
    update: asyncHandler(async (req, res) => {

        //get the post id from the params
        const postId = req.params.postId;

        //find the post by id
        const postFound = await Post.findById(postId);
        if (!postFound) {
            return res.status(404).json({
                status: 'fail',
                message: 'Post not found'
            });
        }
        //update the post
        const postUpdated = await Post.findByIdAndUpdate(
            postId,
            { description: req.body.description, image: req.file },
            { new: true }
        );

        res.status(200).json({
            status: 'success',
            message: 'Post updated successfully',
            postUpdated
        });
    }),

    //Like a post
    like: asyncHandler(async (req, res) => {
        //get the post id from the params
        const postId = req.params.postId;
        //get the user liking the post
        const userId = req.user
        //find the post by id
        const postFound = await Post.findById(postId);
        if (!postFound) {
            return res.status(404).json({
                status: 'fail',
                message: 'Post not found'
            });
        }
        //check if the user has already disliked the post
        const isDisliked = postFound?.dislikes.includes(userId);
        if (isDisliked) {
            postFound?.dislikes?.pull(userId);
        }
        //check if the user has already liked the post
        const isLiked = postFound?.likes.includes(userId);
        if (isLiked) {
            postFound?.likes?.pull(userId);
        }
        else {
            //add the user to the likes array
            postFound?.likes?.push(userId);
        }
        await postFound.save();
        res.status(200).json({
            status: 'success',
            message: 'Post liked successfully',
        });
    }),

    //Dislike a post
    dislike: asyncHandler(async (req, res) => {
        //get the post id from the params
        const postId = req.params.postId;
        //get the user liking the post
        const userId = req.user
        //find the post by id
        const postFound = await Post.findById(postId);
        if (!postFound) {
            return res.status(404).json({
                status: 'fail',
                message: 'Post not found'
            });
        }
        //check if the user has already liked the post
        const isLiked = postFound?.likes.includes(userId);
        if (isLiked) {
            postFound?.likes?.pull(userId);
        }
        //check if the user has already disliked the post
        const isDisliked = postFound?.dislikes.includes(userId);
        if (isDisliked) {
            postFound?.dislikes?.pull(userId);
        }
        else {
            //add the user to the dislikes array
            postFound?.dislikes?.push(userId);
        }
        await postFound.save();
        res.status(200).json({
            status: 'success',
            message: 'Post disliked successfully',
        });
    }),

}

module.exports = postController;