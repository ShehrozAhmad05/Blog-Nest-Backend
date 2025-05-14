const asyncHandler = require('express-async-handler');
const Plan = require('../../models/Plan/Plan');


const planController = {
    //Create a plan
    createPlan: asyncHandler(async (req, res) => {
        const { planName, features, price } = req.body;
        //check if the plan exists
        const planFound = await Plan.findOne({ planName });
        if (planFound) {
            throw new Error('Plan already exists');
        }
        //check if total plans are two
        const planCount = await Plan.countDocuments();
        if (planCount >= 2) {
            throw new Error('You can only create two plans');
        }
        //create the plan
        const planCreated = await Plan.create({
            planName,
            features,
            price,
            user: req.user,

        })
        res.json({
            status: 'success',
            message: 'Plan created successfully',
            planCreated
        });
    }),
    //List all plans
    lists: asyncHandler(async (req, res) => {
    
        const plans = await Plan.find();
        res.status(200).json({
            status: 'success',
            message: 'Plans fetched successfully',
            plans
        });
    
    }),
    //Get a Plan
    getPlan: asyncHandler(async (req, res) => {
    
        const planId = req.params.planId;
        const planFound = await Plan.findById(planId);
        if ( !planFound) {
            return res.status(404).json({
                status: 'fail',
                message: 'Plan not found'
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Plan fetched successfully',
            planFound
        });
    
    }),
    //Delete a Plan
    delete: asyncHandler(async (req, res) => {

        const planId = req.params.planId;
        const planFound = await Plan.findById(planId);
        if (!planFound) {
            return res.status(404).json({
                status: 'fail',
                message: 'Plan not found'
            });
        }
        await Plan.findByIdAndDelete(planId);
        res.status(200).json({
            status: 'success',
            message: 'Plan deleted successfully'
        });
    }),

    //Update a Plan
    update: asyncHandler(async (req, res) => {

        //get the plan id from the params
        const planId = req.params.planId;
    
        //find the plan by id
        const planFound = await Plan.findById(planId);
        if (!planFound) {
            throw new Error('Plan not found');
        }
        //update the plan
        const planUpdated = await Plan.findByIdAndUpdate(
            planId,
            { planName: req.body.planName, features: req.body.features, price: req.body.price },
            { new: true }
        );
    
        res.status(200).json({
            status: 'success',
            message: 'Plan updated successfully',
            planUpdated
        });
    })

}

module.exports = planController;