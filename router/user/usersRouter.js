const express = require('express');
const multer = require('multer');
const userController = require('../../controllers/users/userController');
const isAuthenticated = require('../../middlewares/isAuthenticated');
const storage = require('../../utils/fileupload');
const isAdmin = require('../../middlewares/isAdmin');

const usersRouter = express.Router();

//create instance of multer
const upload = multer({storage});

//Register a new user
usersRouter.post("/register", userController.register);
usersRouter.post("/login", userController.login);
usersRouter.get("/auth/google", userController.googleAuth);
usersRouter.get("/auth/google/callback", userController.googleAuthCallback);
usersRouter.get("/checkAuthenticated", userController.checkAuthenticated); 
usersRouter.post("/logout", userController.logout); 
usersRouter.get("/profile", isAuthenticated, userController.profile);
usersRouter.put("/follow/:followId", isAuthenticated, userController.followUser);
usersRouter.put("/unfollow/:unfollowId", isAuthenticated, userController.unFollowUser);
usersRouter.put("/account-verification-email", isAuthenticated, userController.verifyEmailAccount);
usersRouter.put("/verify-account/:verifyToken", isAuthenticated, userController.verifyEmailAcc);
usersRouter.post("/forgot-password", userController.forgotPassword);
usersRouter.post("/reset-password/:verifyToken", userController.resetPassword);
usersRouter.put("/update-email", isAuthenticated, userController.updateEmail);
usersRouter.put("/upload-profile-picture", isAuthenticated, upload.single('image'), userController.updateProfilePic);
usersRouter.put("/block-user", isAuthenticated, isAdmin, userController.blockUser);
usersRouter.put("/unblock-user", isAuthenticated, isAdmin, userController.unblockUser);
usersRouter.get("/lists", isAuthenticated, isAdmin, userController.listUsers);

module.exports = usersRouter;