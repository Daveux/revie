const mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose"),
    Schema = mongoose.Schema;

const userSchema = new Schema({

    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
    },
    username: {
        type: String,
        unique: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    reviewId: {
        type: Schema.Types.ObjectId,
        ref: 'reviews'
    }
});

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("users", userSchema);

module.exports = User;
