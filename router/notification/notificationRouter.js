const express = require('express');
const isAuthenticated = require('../../middlewares/isAuthenticated');
const notificationController = require('../../controllers/notifications/notificationController');


//create instance express router
const notificationRouter = express.Router();

//List all notifications
notificationRouter.get("/", notificationController.fetchNotifications);

//Read notification
notificationRouter.put("/:notificationId", notificationController.readNotification);

module.exports = notificationRouter;