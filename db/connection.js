const mongoose = require("mongoose");

const connect = async() => {
    console.log("----- In Connection connect method -----");
    try{
        await mongoose.connect(process.env.DB_URI);
        console.log("connected to mongodb");
    }catch(err){
        console.error("----- Error in connecting to mongodb -----", err);
        return Promise.reject("INTERNAL SERVER ERROR");
    }
} 

connect();