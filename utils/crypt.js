const bcrypt = require("bcrypt");
const _ = require("lodash");

const encrypt = async (plainText) => {
    console.log("----- In Crypt encrypt method -----");
    try{
        if(_.isEmpty(plainText)){
            return Promise.reject("Cannot Encypt Empty Content");
        }
        const genSalt = await bcrypt.genSalt(+process.env.CRYPT_SALT);
        const hashPassword = await bcrypt.hash(plainText, genSalt);

        return Promise.resolve(hashPassword);
    }catch(err){
        console.error("----- Error in Crypt encrypt method -----", err);
        return Promise.reject(err);
    }
}

const verify = async (password, hashPassword) => {
    console.log("----- In Crypt verify method -----");
    try{
        const result = await bcrypt.compare(password, hashPassword);

        if(result){
            return Promise.resolve(result);
        }else{
            throw new Error("Invalid Password try again.");
        }
    }catch(err){
        console.error("----- Error in Crypt verify method -----", err);
        return Promise.reject("Could not verify the user");
    }
}

module.exports = {
    encrypt,
    verify
}