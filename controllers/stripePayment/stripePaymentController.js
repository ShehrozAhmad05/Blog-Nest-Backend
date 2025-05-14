const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Plan = require('../../models/Plan/Plan');
const User = require('../../models/User/User');
const Payment = require('../../models/Payment/Payment');

//Stripe Payment
const stripePaymentController = {
    //payment
    payment: asyncHandler(async (req, res) => {
        //Get the plan Id
        const { subscriptionPlanId } = req.body
        //Checking for the valid id of the plan
        if (!mongoose.isValidObjectId(subscriptionPlanId)) {
            return res.json({ message: "Invalid Subsciption Plan Id" })
        }
        //Find the plan
        const plan = await Plan.findById(subscriptionPlanId)
        if (!plan) {
            return res.json({ message: "Subscription Plan not found" })
        }
        //get the user
        const user = req.user
        //Create payment intent/making the payment
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: plan.price * 100, //amount in cents
                currency: 'usd',
                //automatic_payment_methods: { enabled: true },
                metadata: {
                    userId: user?.toString(),
                    //userEmail: user?.email,
                    subscriptionPlanId,
                },
            });
            //Send the response
            res.json({
                clientSecret: paymentIntent.client_secret,
                //userEmail: user?.email,
                subscriptionPlanId,
                paymentIntent
            });
        } catch (error) {
            res.json({ message: "Payment failed", error: error.message });
        }
    }),
    //verifying the payments
    verify: asyncHandler(async (req, res) => {
        //Get the payment Id
        const { paymentId } = req.params
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
        //confirm the payment status
        if (paymentIntent.status !== 'success') {
            //get the data from the metadata
            const metadata = paymentIntent?.metadata
            const subscriptionPlanId = metadata?.subscriptionPlanId
            const userId = metadata.userId
            //Find the user
            const userFound = await User.findById(userId)
            if (!userFound) {
                return res.json({ message: 'User not Found' })
            }
            //Get the payment details   
            const amount = paymentIntent?.amount / 100
            const currency = paymentIntent?.currency
            //create the payment history
            const newPayment =await Payment.create({
                user: userId,
                subscriptionPlan: subscriptionPlanId,
                status: 'success',
                amount,
                currency,
                reference: paymentId
            })
            if(newPayment){
                //update the user Profile
                userFound.hasSelectedPlan = true
                userFound.plan = subscriptionPlanId
                await userFound.save() 
            }
            //send the response
            res.json({
                status: true,
                message: 'Payment Verfied, User Updated',
                userFound
            })
        } 
    }),
    free:asyncHandler(async(req, res)=>{
        //check for the user
        const user =await User.findById(req.user)
        if(!user){
            throw new Error("User not Found")
        }
        //update the user field
        user.hasSelectedPlan = true
        await user.save()
        //send the response
        res.json({
            status: true,
            message: 'Payment Verfied, User Updated',
        })
    })

}

module.exports = stripePaymentController