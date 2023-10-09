const crypt = require("./../utils/crypt");
const _ = require("lodash");

const UsersModel = require("./../db/users/usersModel");
const jwt = require("./../middleware/authorization");

const registerUser = async (req, res) => {
    console.log("----- In UsersModule registerUser method -----");
    try{
        const {name, email, password, mobile} = req.body;

        if(_.isEmpty(email) || email.search(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/) == '-1'){
            throw new Error("Please provide a valid Email");
        }

        const findUser = await UsersModel.findOne({ email: { '$regex': `${email}`, '$options': 'i' } });


        if(!_.isEmpty(findUser)){
            throw new Error("Email already exist, please try to login");
        }

        if(_.isEmpty(password)){
            throw new Error("Please provide Password");
        }

        const hashPassword = await crypt.encrypt(password);

        const userId = await getNextUserId();

        if(_.isEmpty(userId) && typeof userId !== "number"){
            throw new Error("Could not create User, try again")
        }

        const token = await jwt.generateToken({userId});

        const response = await UsersModel.createUser({
            userId,
            name, 
            password: hashPassword,
            email,
            mobile,
            tokens: [{token}]
        });

        // setting the user id in the session for the user
        req.session.userId = userId;

        // saving the token in the redis
        await redisClient.SADD(`user:token:${userId}`, token);

        const data = {
            ...response,
            "token": token
        }

        return res.send({
            status: "Success",
            data
        });

    }catch(err){
        console.error("----- Error in UsersModule registerUser method -----", err);
        return res.status(400).send({
            status: "Failed",
            error: err.message ? err.message : err
        });
    }
}

const getProfile = async (req, res) => {
    console.log("----- In UserModule getProfile method -----");
    try{
        const { user } = req;

        delete user.password;
        delete user.tokens;
        delete user.__v;

        return res.send({
            status: "Success",
            data: user
        })
    }catch(err){
        console.error("----- Error in UserModules getProfile method -----", err);
        return res.status(400).send({
            status: "Failed",
            error: err.message ? err.message: err
        })
    }
}

const loginUser = async (req, res) => {
    console.log("----- In UserModules loginUser method -----");
    try{
        const { email, password } = req.body;

        const user = await UsersModel.findOne({ email: { '$regex': `${email}`, '$options': 'i' } });
        if(_.isEmpty(user)){
            throw new Error("Email not Found, try register");
        }

        if(_.isEmpty(password)){
            throw new Error("Please Enter Password.")
        }

        // verifying the password
        await crypt.verify(password, user.password);

        const token = await jwt.generateToken({ userId: user.userId });

        // adding the new token in the tokens record
        user.tokens.push({token});

        await UsersModel.update({userId: user.userId}, {"$set": {tokens: user.tokens}});
        
        //setting the token in the redis
        await redisClient.SADD(`user:token:${user.userId}`, token);

        // deleting the sensitive information
        delete user.tokens;
        delete user.password;

        return res.send({
            status: "Success",
            data: {
                ...user,
                token
            }
        });

    }catch(err){
        console.error("----- Error in UserModule loginUser method -----", err);
        return res.status(400).send({
            status: "Failed",
            error: err.message ? err.message: err
        })
    }
}

const logout = async (req, res) => {
    console.log("----- In UsersModule logout method -----");
    try{
        const { user, token: providedToken } = req;
        
        const newTokens = user.tokens.filter(token => token.token !== providedToken);

        await UsersModel.update({ userId: user.userId }, {$set: {tokens: newTokens}});

        // remove the token from the redis
        await redisClient.SREM(`user:token:${user.userId}`, providedToken);

        return res.send({
            status: "Success",
            data: "Logged out"
        });
    }catch(err){
        console.error("----- Error in UsersModule logout method -----");
        return res.status(400).send({
            status: "Failed",
            error: err.message ? err.message : err
        })
    }
}

const logoutAll = async (req, res) => {
    console.log("----- In UsersModule logoutAll method -----");
    try{
        const { user } = req;

        await UsersModel.update({ userId: user.userId }, {$set: {tokens: []}});

        await redisClient.DEL(`user:token:${user.userId}`);

        return res.send({
            status: "Success",
            data: "Logged out from all device"
        });


    }catch(err){
        console.error("----- Error in UsersModule logoutAll method -----", err);
        return res.status(400).send({
            status: "Failed",
            error: err.message ? err.message : err
        })
    }
}

const getNextUserId = async () => {
    console.log("----- In UsersModule getNextUserId method -----");
    try{
        const currentTopUser = await UsersModel.findAll({}, {}, {sort: {userId: -1}, limit: 1});

        if(!_.isEmpty(currentTopUser) && _.isEmpty(currentTopUser[0].userId)){
            // alert of ambiguity in the user id
        }

        const nextUserId = !_.isEmpty(currentTopUser) ? +currentTopUser[0].userId + 1 : 100;

        console.log("new user id ===> ", nextUserId);

        return Promise.resolve(nextUserId);
        
    }catch(err){
        console.error("----- Error in UsersModule getNextUserId method -----", err);
        return Promise.reject(err);
    }
}

module.exports = {
    registerUser,
    getProfile,
    loginUser,
    logout,
    logoutAll
}