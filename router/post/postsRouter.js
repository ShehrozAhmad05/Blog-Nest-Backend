const express = require('express');
const multer = require('multer');
const postController = require('../../controllers/posts/postController');
const storage = require('../../utils/fileupload');
const isAuthenticated = require('../../middlewares/isAuthenticated');
const checkUserPlan = require('../../middlewares/checkUserPlan');
const optionalAuth = require('../../middlewares/optionalAuth');
const isAccountVerified = require('../../middlewares/isAccountVerified');
const isBlocked = require('../../middlewares/isBlocked');

//create instance of multer
const upload = multer({ storage });

//create instance express router
const postRouter = express.Router();

//Create a post
postRouter.post("/create", isAuthenticated,
    isBlocked,
    checkUserPlan,
    isAccountVerified,
    upload.single('image'),
    postController.createPost);

//Get all posts
postRouter.get("/", postController.fetchAllPosts);

//update a post
postRouter.put("/:postId", isAuthenticated, isBlocked, upload.single('image'), postController.update);

//get a post
postRouter.get("/:postId", optionalAuth, postController.getPost);

//delete a post
postRouter.delete("/:postId", isAuthenticated, isBlocked, postController.delete);

//like a post
postRouter.put("/likes/:postId", isAuthenticated, isBlocked, postController.like);

//dislike a post
postRouter.put("/dislikes/:postId", isAuthenticated, isBlocked, postController.dislike);

module.exports = postRouter;