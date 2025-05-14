const express = require('express');
const isAuthenticated = require('../../middlewares/isAuthenticated');
const earningsController = require('../../controllers/earnings/earningsController');


//create instance express router
const earningsRouter = express.Router();


//Get all earnigs
earningsRouter.get("/", earningsController.fetchAllEarnings);

earningsRouter.get("/my-earnings", isAuthenticated, earningsController.getUserEarnings);

module.exports = earningsRouter;