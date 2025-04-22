const express = require("express");
const routes = express.Router();
const authController = require("../controllers/authcontroller");

routes.post("/register", authController.registeredUser);
routes.post("/login", authController.loginUser);
routes.post("/logout", authController.logout);
module.exports = routes;
