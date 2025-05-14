const asyncHandler = require('express-async-handler');
const Post = require('../../models/Post/Post');
const Category = require('../../models/Category/Category');


const categoryController = {
    //Create a category
    createCategory: asyncHandler(async (req, res) => {
        const { categoryName, description } = req.body;
        //check if the category exists
        const categoryFound = await Category.findOne({ categoryName });
        if (categoryFound) {
            throw new Error('Category already exists');
        }
        //create the category
        const categoryCreated = await Category.create({
            categoryName,
            author: req.user,

        })
        res.json({
            status: 'success',
            message: 'Category created successfully',
            categoryCreated
        });
    }),
    //List all categories
    fetchAllCategories: asyncHandler(async (req, res) => {
    
        const categories = await Category.find();
        res.status(200).json({
            status: 'success',
            message: 'Categories fetched successfully',
            categories
        });
    
    }),
    //Get a category
    getCategory: asyncHandler(async (req, res) => {
    
        const categoryId = req.params.categoryId;
        const categoryFound = await Category.findById(categoryId);
        if ( !categoryFound) {
            return res.status(404).json({
                status: 'fail',
                message: 'Category not found'
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Category fetched successfully',
            categoryFound
        });
    
    }),
    //Delete a category
    delete: asyncHandler(async (req, res) => {

        const categoryId = req.params.categoryId;
        const categoryFound = await Category.findById(categoryId);
        if (!categoryFound) {
            return res.status(404).json({
                status: 'fail',
                message: 'Category not found'
            });
        }
        await Category.findByIdAndDelete(categoryId);
        res.status(200).json({
            status: 'success',
            message: 'Category deleted successfully'
        });
    }),

    //Update a category
    update: asyncHandler(async (req, res) => {

        //get the category id from the params
        const categoryId = req.params.categoryId;
    
        //find the category by id
        const categoryFound = await Category.findById(categoryId);
        if (!categoryFound) {
            throw new Error('Category not found');
        }
        //update the post
        const categoryUpdated = await Category.findByIdAndUpdate(
            categoryId,
            { categoryName: req.body.categoryName, description: req.body.description },
            { new: true }
        );
    
        res.status(200).json({
            status: 'success',
            message: 'Category updated successfully',
            categoryUpdated
        });
    })

}

module.exports = categoryController;