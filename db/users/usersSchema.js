const { Schema } = require("mongoose");

const usersSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    name : {
        type: String,
        default: ""
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        default: ""
    },
    completeTodo: {
        type: Number,
        default: 0
    },
    incompleteTodo: {
        type: Number,
        default: 0
    },
    tokens:[{
        token: String
    }]
}, {
    timestamps: true
});

usersSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        delete ret.password;
        delete ret.tokens;
        return ret;
    }
});

module.exports = usersSchema;