const mongoose = require("mongoose");
const usersSchema = require("./usersSchema");

const User = new mongoose.model("Users", usersSchema, "Users");

const createUser = async (userObject) => {
    console.log("----- In usersModel create method -----");
    try{
        const obj = await User.create(userObject);

        const data = obj.toObject()

        delete data.password;
        delete data.tokens;
        delete data.__v;

        return Promise.resolve(data);
    }catch(err){
        console.error("----- Error in usersModel createUser method -----", err);
        return Promise.reject("Unable to add Record");
    }
}

const getUserbyId = async (filter) => {
    console.log("----- In usersModel getUserbyId method -----");
    try{
        const records = await User.find({...filter}).lean();
        return Promise.resolve(records);
    }catch(err){
        console.error("----- Error in usersModel getTodoList method -----", err);
        return Promise.reject("Could not get the list.")
    }
}

const findOne = async (filter = {}, projection = {}, options = {}) => {
    console.log("----- In usersModel findOne method -----");
    try{
        const record = await User.findOne(filter, projection, options).lean();

        return Promise.resolve(record);
    }catch(err){
        console.error("----- Error in usersModel findOne method -----", err);
        return Promise.reject("Unexpected Error Occured.");
    }
}

const findAll = async (filter = {}, projection = {}, options = {}) => {
    console.log("----- In usersModel findAll method -----");
    try{

        const records = await User.find(filter, projection, options).lean();

        return Promise.resolve(records);
    }catch(err){
        console.error("----- Error in usersModel findAll method -----", err);
        return Promise.reject(err);
    }
}

const update = async (filter, updateArg, options = {}) => {
    console.log("----- In userModel update method -----");
    try{
        const record = await User.updateOne(filter, updateArg, options);

        return record;
    }catch(err){
        console.error("----- Error in userModel update method -----");
        return Promise.reject(err);
    }
}

module.exports = {
    createUser, 
    getUserbyId,
    findAll,
    findOne,
    update
}