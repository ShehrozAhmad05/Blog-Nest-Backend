const express = require('express');
const isAuthenticated = require('../../middlewares/isAuthenticated');
const categoryController = require('../../controllers/categories/categoryController');
const isAdmin = require('../../middlewares/isAdmin');


//create instance express router
const categoriesRouter = express.Router();

//Create a category
categoriesRouter.post("/create", isAuthenticated, isAdmin, categoryController.createCategory);

//Get all categories
categoriesRouter.get("/", categoryController.fetchAllCategories);

//update a category
categoriesRouter.put("/:categoryId", isAuthenticated, isAdmin, categoryController.update);

//get a category
categoriesRouter.get("/:categoryId", categoryController.getCategory);

//delete a category
categoriesRouter.delete("/:categoryId", isAuthenticated, isAdmin, categoryController.delete);

module.exports = categoriesRouter;