const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({

    comment: {
        type: String,
    },

    video: {
        type: String,
    },

    images: {
        type: Array,
    },
    date: {
        type: Date
    },

    helpful: {
        type: Number
    }
});

const Review = mongoose.model("reviews", reviewSchema);

module.exports = Review;
