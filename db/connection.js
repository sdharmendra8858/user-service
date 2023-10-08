const mongoose = require("mongoose");

const connect = async() => {
    try{
        await mongoose.connect(process.env.DB_URI);
        console.log("connected to mongodb");
    }catch(err){
        console.log("Error in connecting to mongodb", err);
    }
} 


connect();