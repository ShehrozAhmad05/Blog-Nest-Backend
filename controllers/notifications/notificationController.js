const asyncHandler = require('express-async-handler');
const Notification = require('../../models/Notification/Notification');
const mongoose = require('mongoose');


const notificationController = {
    
    //List all notifications
    fetchNotifications: asyncHandler(async (req, res) => {
    
        const notifications = await Notification.find();
        res.status(200).json(notifications);
    
    }),

    //Read notification
    readNotification: asyncHandler(async (req, res) => {

        //get the notification id from the params
        const notificationId = req.params.notificationId;
        //check if the notification exists
        const isValidId = mongoose.Types.ObjectId.isValid(notificationId); 
        if (!isValidId) {
            throw new Error('Invalid notification id');
        }
        //Update the notification to read
        await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
        res.status(200).json({message: 'Notification read successfully'});
    })

}

module.exports = notificationController;