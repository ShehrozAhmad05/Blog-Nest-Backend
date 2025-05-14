const e = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { type } = require("os");

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: Object,
        default: null,
    },
    email: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        default: "user",
    },
    googleId: {
        type: String,
        required: false,
    },
    authMethod: {
        type: String,
        enum: ["local", "google","facebook", "github"],
        required: true,
        default: "local",
    },
    passwordResetToken: {
        type: String,
        default: null,
    },
    passwordResetExpires: {
        type: Date,
        default: null,
    },
    accountVerificationToken: {
        type: String,
        default: null,
    },
    accountVerificationExpires: {
        type: Date,
        default: null,
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
    ],
    totalEarnings: {
        type: Number,
        default: 0,
    },
    nextEarningDate: {
        type: Date,
        default: () =>
            new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), // Next month's 1st date
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
    }, 
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    payments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
        },
    ],
    hasSelectedPlan: {
        type: Boolean,
        default: false,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    //Account type
    accountType:{
        type: String,
        default: "Basic",
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    // isAdmin: {
    //     type: Boolean,
    //     required: true,
    //     default: false,
    // },
}   , { timestamps: true }
);

//Generate a token for account verification
userSchema.methods.generateAccVerificationToken = function () {
    const emailToken = crypto.randomBytes(20).toString("hex")
    //assign the token to the user
    this.accountVerificationToken = crypto
        .createHash("sha256")
        .update(emailToken)
        .digest("hex")
        this.accountVerificationExpires = Date.now() + 10 * 60 * 1000 //10 minutes
    return emailToken
};

//Generate a token for password reset
userSchema.methods.generatePasswordResetToken = function () {
    const emailToken = crypto.randomBytes(20).toString("hex")
    //assign the token to the user
    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(emailToken)
        .digest("hex")
        this.passwordResetExpires = Date.now() + 10 * 60 * 1000 //10 minutes
    return emailToken
};

//method to update user account type
userSchema.methods.updateAccountType = function () {
    const postCount = this.posts.length;
    if(postCount >= 50) {
        this.accountType = "Premium";
    }
    else if(postCount >= 10) {
        this.accountType = "Standard"; 
    } else {
        this.accountType = "Basic";
    }
};

const User = mongoose.model("User", userSchema);
module.exports = User;