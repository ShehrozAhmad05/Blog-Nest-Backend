const express = require('express');
const isAuthenticated = require('../../middlewares/isAuthenticated');
const planController = require('../../controllers/plan/planController');
const isAdmin = require('../../middlewares/isAdmin');

//create instance express router
const planRouter = express.Router();

//Create a plan
planRouter.post("/create", isAuthenticated, isAdmin, planController.createPlan);

//Get all Plans
planRouter.get("/", planController.lists);

//update a plan
planRouter.put("/:planId",isAuthenticated, isAdmin, planController.update);

//get a plan
planRouter.get("/:planId", planController.getPlan);

//delete a plan
planRouter.delete("/:planId",isAuthenticated, isAdmin, planController.delete);

module.exports = planRouter;