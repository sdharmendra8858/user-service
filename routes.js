const express = require("express");

const usersModule = require("./modules/users");
const auth = require("./middleware/authorization");

const routes = express.Router();

routes.post("/users", usersModule.registerUser);
routes.get("/me", auth.verifyToken, usersModule.getProfile);
routes.post("/login", usersModule.loginUser);
routes.post("/logout", auth.verifyToken, usersModule.logout);
routes.post("/logoutAll", auth.verifyToken, usersModule.logoutAll);

module.exports = routes;