const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({

    // title: {
    //     type: String,
    //     required: true,
    //     trim: true,
    // },
    description: {
        type: String,
        required: true,
        trim: true,
    },

    image:{
        type: Object,
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
      
    nextEarningDate: {
        type: Date,
        default: ()=> 
            new Date(new Date().getFullYear() , new Date().getMonth() + 1, 1), // Next month's 1st date
    },

    thisMonthEarnings: {
        type: Number,
        default: 0,
    },
    totalEarnings: {
        type: Number,
        default: 0,
    },
    lastCalculatedViewsCount:{
        type: Number,
        default: 0, 
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    viewsCount: {
        type: Number,
        default: 0,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    dislikes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    viewers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],

    isBlocked: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;


