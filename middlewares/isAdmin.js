const User = require("../models/User/User");
const asyncHandler = require("express-async-handler")

const isAdmin = asyncHandler(async(req, res, next)=>{
    try {
        //check the logged in user
        const user = await User.findById(req.user)
        //check user role
        if(user?.role !== "admin"){
            return res.status(401).json({
                message: "You are not authorized to access this resource.",
            })
        }
        next()
    } catch (error) {
        return res.json(error)
    }
})

module.exports = isAdmin;