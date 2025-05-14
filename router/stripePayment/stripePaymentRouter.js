const express = require('express');
const isAuthenticated = require('../../middlewares/isAuthenticated');
const stripePaymentController = require('../../controllers/stripePayment/stripePaymentController');

//create instance express router
const stripePaymentRouter = express.Router();

//Create a payment
stripePaymentRouter.post("/checkout", isAuthenticated, stripePaymentController.payment);

//Verify the payment
stripePaymentRouter.get("/verify/:paymentId", stripePaymentController.verify); 

stripePaymentRouter.get("/free-plan", isAuthenticated, stripePaymentController.free); 


module.exports = stripePaymentRouter;