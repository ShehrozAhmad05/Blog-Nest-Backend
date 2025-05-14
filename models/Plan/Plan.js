const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
    planName: {
        type: String,
        required: true,
    },
    features: [String], 
    price: {
        type: Number,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true }
);

const Plan = mongoose.model("Plan", planSchema);
module.exports = Plan;