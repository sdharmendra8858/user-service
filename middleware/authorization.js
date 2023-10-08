const jwt = require("jsonwebtoken");
const _ = require("lodash");

const UsersModel = require("./../db/users/usersModel");

const generateToken = async (payload) => {
    console.log("----- In Middleware generateToken method -----");
    try{
        const { userId } = payload;
        const token = await jwt.sign({ userId }, process.env.JWT_KEY, { expiresIn: process.env.JWT_EXPIRE });

        return token;
    }catch(err){
        console.error("----- Error in Middleware generateToken method -----", err);
        return Promise.reject("Unexpected Error while Logging, try again.");
    }
}

const verifyToken = async (req, res, next) => {
    console.log("----- In Middleware verifyToken method -----");
    try{
        if(_.isEmpty(req.headers.token)){
            throw new Error("Invalid token")
        }
        const decode = await jwt.verify(req.headers.token, process.env.JWT_KEY);

        req.token = req.headers.token;

        const user = await UsersModel.findOne({ userId: decode.userId, tokens: { $elemMatch: {token: req.token} } });

        if(_.isEmpty(user)){
            throw new Error("Session expired, please log in.")
        }

        req.user = user;

        next();
    }catch(err){
        console.error("----- Error in Middleware verifyToken method -----", err);
        return res.status(400).send({
            status: "Failed",
            error: err.message
        })
    }
}

module.exports = {
    generateToken,
    verifyToken
}