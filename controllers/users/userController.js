const asyncHandler = require("express-async-handler");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const passport = require("passport");
const User = require("../../models/User/User");
const sendAccVerificationEmail = require("../../utils/sendAccVerificationEmail");
const sendPasswordEmail = require("../../utils/sendPasswordEmail");


//User controller
const userController = {
    //Register a new user
    register: asyncHandler(async (req, res) => {
        const { username, email, password } = req.body;
        //const userFound = await User.findOne({ username, email }); //Old Error Logic 
        const userFound = await User.findOne({
            $or: [{ username }, { email }]
        });
        if (userFound) {
            throw new Error("User already exists");
        }
        //Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        //register the user
        const userRegistered = await User.create({
            username,
            email,
            password: hashedPassword,
        });
        //send the response
        res.status(201).json({
            status: 'success',
            message: "User registered successfully",
            userRegistered
        });
    }),

    //Login a user
    login: asyncHandler(async (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return next(err);
            }
            //If user not found
            if (!user) {
                return res.status(401).json({
                    message: info.message
                });
            }
            //generate token
            const token = jwt.sign({ id: user?._id }, process.env.JWT_SECRET)
            //set the token into the cookie 
            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000,  //1 day
            })
            //send the response
            res.json({
                status: 'success',
                message: "Login Successfull",
                username: user?.username,
                email: user?.email,
                _id: user?._id
            })
        })(req, res, next);
    }),

    //Google Auth
    googleAuth: passport.authenticate('google', {
        scope: ['profile']
    }),
    //Google Auth Callback
    googleAuthCallback: asyncHandler(async (req, res, next) => {
        passport.authenticate('google',
            {
                failureRedirect: '/login',
                session: false
            }, (err, user, info) => {
                if (err) {
                    return next(err)
                }
                if (!user) {
                    return res.redirect('http://localhost:5173/google-login-error')
                }
                //generate token
                const token = jwt.sign({ id: user?._id }, process.env.JWT_SECRET, {
                    expiresIn: '3d'
                })
                //set the token into the cookie
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000,  //1 day
                })
                //redirect to the user dashboard
                res.redirect('http://localhost:5173/dashboard')
            }
        )(req, res, next)
    }),

    //check user authentication status
    checkAuthenticated: asyncHandler(async (req, res) => {
        const token = req.cookies['token']
        if (!token) {
            return res.status(401).json({
                isAuthenticated: false,
            })
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            //Find the user
            const user = await User.findById(decoded.id).select('-password')
            if (!user) {
                return res.status(401).json({
                    isAuthenticated: false,
                })
            } else {
                return res.status(200).json({
                    isAuthenticated: true,
                    _id: user?._id,
                    username: user?.username,
                    profilePicture: user?.profilePicture,
                })
            }
        }
        catch (error) {
            return res.status(401).json({
                isAuthenticated: false,
                error
            })
        }

    }),

    //logout the user
    logout: asyncHandler(async (req, res) => {
        res.cookie('token', '', { maxAge: 1 })
        res.status(200).json({
            message: 'Logout successfull'
        })
    }),
    //profile
    profile: asyncHandler(async (req, res) => {
        const user = await User.findById(req.user)
        .populate('followers')
        .populate('following')
        .populate('posts')
        .select('-password -passwordResetToken -passwordResetExpires -accountVerificationToken -accountVerificationExpires')
        res.json({
            user,
        })
    }),

    //Follow a user
    followUser: asyncHandler(async (req, res) => {
        //Find the user who wants to follow another user
        const userId = req.user
        //Get the user to follow
        const followId = req.params.followId
        //Update the user followers and following array
        await User.findByIdAndUpdate(userId, {
            $addToSet: { following: followId }
        }, { new: true }
        )
        //Update the user who is being followed
        await User.findByIdAndUpdate(followId, {
            $addToSet: { followers: userId }
        }, { new: true }
        )
        res.status(200).json({
            message: 'User followed successfully'
        })
    }),

    //Unfollow a user
    unFollowUser: asyncHandler(async (req, res) => {
        //Find the user who wants to follow another user
        const userId = req.user
        //Get the user to follow
        const unfollowId = req.params.unfollowId
        //Find the user who is being followed
        const user = await User.findById(userId)
        const unfollowUser = await User.findById(unfollowId)
        if (!user || !unfollowUser) {
            throw new Error("User not found")
        }
        user.following.pull(unfollowId)
        unfollowUser.followers.pull(userId)
        //save the user
        await user.save()
        await unfollowUser.save()
        res.status(200).json({
            message: 'User unfollowed successfully'
        })
    }),

    //Verify the email account (token)
    verifyEmailAccount: asyncHandler(async (req, res) => {
        //find the logged in user
        const user = await User.findById(req.user)
        if (!user) {
            throw new Error("User not found, please login")
        }
        //check if user email exists
        if (!user?.email) {
            throw new Error("Email not found")
        }
        //use the method from the model
        const token = await user.generateAccVerificationToken()
        //save the user
        await user.save()
        //send the email
        sendAccVerificationEmail(user?.email, token)
        res.status(200).json({
            message: `Account Verification email sent to ${user?.email}, token will expire in 10 minutes`,
        })
    }),

    //Verify the email account
    verifyEmailAcc: asyncHandler(async (req, res) => {
        //Get the token
        const { verifyToken } = req.params
        //Convert the token to actual token that has been saved in the database
        const cryptoToken = crypto.createHash('sha256').update(verifyToken).digest('hex')
        //Find the user
        const userFound = await User.findOne({
            accountVerificationToken: cryptoToken,
            accountVerificationExpires:{$gt: Date.now()}
        })
        if(!userFound) {
            throw new Error("Token is invalid or has expired")
        }
        //update the user field
        userFound.isEmailVerified = true
        userFound.accountVerificationToken = null
        userFound.accountVerificationExpires = null
        //save the user
        await userFound.save()
        res.json({ message: "Account successfully verified"})
    }),

    //forgot password (sending email token)
    forgotPassword: asyncHandler(async (req, res) => {
        //find the user email
        const { email } = req.body
        //find the user
        const user = await User.findOne({email})
        if (!user) {
            throw new Error(`User with email ${email} not found`)
        }
        //check if user registered with google account
        if (user.authMethod !== 'local') {
            throw new Error("Please login with your social account")
        }

        //use the method from the model
        const token = await user.generatePasswordResetToken()
        //save the user
        await user.save()
        //send the email
        sendPasswordEmail(user?.email, token)
        res.status(200).json({
            message: `Password reset email sent to ${email}`,
        })
    }),

    //Reset Password
    resetPassword: asyncHandler(async (req, res) => {
        //Get the token
        const { verifyToken } = req.params
        const { password } = req.body
        //Convert the token to actual token that has been saved in the database
        const cryptoToken = crypto.createHash('sha256').update(verifyToken).digest('hex')
        //Find the user
        const userFound = await User.findOne({
            passwordResetToken: cryptoToken,
            passwordResetExpires:{$gt: Date.now()}
        })
        if(!userFound) {
            throw new Error("Token is invalid or has expired")
        }
        //update the user field
        //change the password
        const salt = await bcrypt.genSalt(10)
        userFound.password = await bcrypt.hash(password, salt)
        userFound.passwordResetToken = null
        userFound.passwordResetExpires = null
        //save the user
        await userFound.save()
        res.json({ message: "Password  successfully reset" })
    }),

    //update user email
    updateEmail: asyncHandler(async (req,res) => {
        //email
        const {email} = req.body
        //find the user
        const user = await User.findById(req.user)
        //update the user email
        user.email = email
        user.isEmailVerified = false
        //save the user
        await user.save()
        //use the method from the model
        const token = await user.generateAccVerificationToken()
        //send the email
        sendAccVerificationEmail(user?.email, token)
        //send the response
        res.status(200).json({
            message: `Account Verification email sent to ${user?.email}, token will expire in 10 minutes`,
        })

    }),

    updateProfilePic: asyncHandler(async (req, res) => {
        //Find the user
        await User.findByIdAndUpdate(req.user,{
            $set: {profilePicture: req.file}
        },{new: true})
        //send the response
        res.json({
            message: "Profile picture updated successfully",
        })
    }),

    //Block a user
    blockUser: asyncHandler(async (req, res) => {
        //find the user by id
        const {userId} = req.body
        const user = await User.findByIdAndUpdate(userId, {isBlocked: true}, {new: true})
        if (!user) {
            res.status(404).json({
                message: "User not found"
            })
        }else {
            res.status(200).json({
                message: "User blocked successfully",
                username: user.username,
                isBlocked: user.isBlocked
            })
        }
    }),

    //Unblock a user
    unblockUser: asyncHandler(async (req, res) => {
        //find the user by id
        const {userId} = req.body
        const user = await User.findByIdAndUpdate(userId, {isBlocked: false}, {new: true})
        if (!user) {
            res.status(404).json({
                message: "User not found"
            })
        }else {
            res.status(200).json({
                message: "User unblocked successfully",
                username: user.username,
                isBlocked: user.isBlocked
            })
        }
    }),

    //List all users
    listUsers: asyncHandler(async (req, res) => {
        const users = await User.find()
        res.json(users)
    }),
};

module.exports = userController;