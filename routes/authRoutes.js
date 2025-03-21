const express = require("express");
const routes = express.Router();
const authController = require("../controllers/authcontroller");

routes.post("/register", authController.registeredUser);
routes.post("/login", authController.loginUser);
module.exports = routes;
