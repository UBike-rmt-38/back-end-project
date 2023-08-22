"use strict";
const express = require("express");
const Controller = require("../controllers");
const router = express.Router();
const auth = require("../middlewares/auth");

router.post("/register", Controller.register);
router.post("/login", Controller.login);
router.get("/categories", Controller.readCategories);
router.get("/bicycles", Controller.readBicycles);
router.get("/bicycles/:id", Controller.readBicycleById);
router.use(auth);
router.post("/rentals", Controller.startRental);
router.patch("/rentals/:id", Controller.finishRental);
router.post("/generate-midtrans-token", Controller.createSnapTransaction)

module.exports = router;
