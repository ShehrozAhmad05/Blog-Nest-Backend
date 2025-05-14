const express = require('express');
const isAuthenticated = require('../../middlewares/isAuthenticated');
const commentsController = require('../../controllers/comments/commentsController');


//create instance express router
const commentRouter = express.Router();

//Create a comment
commentRouter.post("/create", isAuthenticated, commentsController.create);

module.exports = commentRouter;