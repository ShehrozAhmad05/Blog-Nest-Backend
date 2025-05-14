const User = require("../models/User/User");
const asyncHandler = require("express-async-handler")

const isBlocked = asyncHandler(async(req, res, next)=>{
    try {
        //check the logged in user
        const user = await User.findById(req.user)
        //check user plan
        if(user?.isBlocked){
            return res.status(401).json({
                message: "Your account has been blocked. Please contact support for assistance.",
            })
        }
        next()
    } catch (error) {
        return res.json(error)
    }
})

module.exports = isBlocked;