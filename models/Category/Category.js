const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema
    ({
        categoryName: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        posts:
            [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Post',
                },
            ],
        author:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    }, { timestamps: true }
    );
const Category = mongoose.model('Category', categorySchema);
module.exports = Category;

