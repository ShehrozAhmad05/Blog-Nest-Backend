const User = require("../models/User/User");
const asyncHandler = require("express-async-handler")

const isAccountVerified = asyncHandler(async(req, res, next)=>{
    try {
        //check the logged in user
        const user = await User.findById(req.user)
        //check user plan
        if(!user?.isEmailVerified){
            return res.status(401).json({
                message: "Access Denied, You must verify your email",
            })
        }
        next()
    } catch (error) {
        return res.json(error)
    }
})

module.exports = isAccountVerified;