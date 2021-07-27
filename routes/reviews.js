const express = require("express"),
    router = express.Router(),
    logger = require('../utils/logger'),
    Review = require("../models/Reviews");



router.put("/addReview", async (req, res) => {

    //Checks for optional video and audio reviews
    let images, video;
    if (req.body.images) {
         images = req.body.images;
    } else {
        images = [];
    }
    if (req.body.video) {
         video = req.body.video;
    } else {
         video = "";
    }
    Review.updateOne({
        _id: req.body.reviewId
        },
        {
        comment: req.body.comment,
        images,
        video,
        date: Date.now()
    })
        .then((review) => {
            console.log(review);
            logger.info(`200 - Review Added. Username: ${req.body.username} ${review}`);
            return res.status(200).json({status: 200, msg: "Ok"});
        })
        .catch((err) => {
            logger.error(`500 - Review Not Added. Username: ${req.body.username}`);
            return res.json({ status: 500, msg: "Bad" });
        });
});

router.get("/getSingleReview", async (req, res) => {

    Review.findById({_id: req.body.reviewId})
        .then(review => {
            return res.json({status: 200, msg: review})
        })
        .catch(() =>{
            return res.json({status: 500, msg: "Could not get review"})
        })
});

router.get("/getAllReviews", async (req, res) => {
    Review.find()
        .then(reviews => {
            return res.json({status: 200, msg: reviews})
        })
        .catch(() =>{
            return res.json({status: 500, msg: "Could not get review"})
        })
});

router.get("/sortByHelpful", async (req, res) => {
    Review.find().sort({helpful: -1})
        .then(reviews => {
            return res.json({status: 200, msg: reviews})
        })
        .catch(() =>{
            return res.json({status: 500, msg: "Could not get review"})
        })
})

router.get("/sortByDate", async (req, res) => {
    Review.find().sort({date: -1})
        .then(reviews => {
            return res.json({status: 200, msg: reviews})
        })
        .catch(() =>{
            return res.json({status: 500, msg: "Could not get review"})
        })
})

router.put("/reviewHelpful", async (req, res) => {

    Review.updateOne({
            _id: req.body.reviewId
        },
        {
            $inc: {
                helpful: 1
            }
        })
        .then(() => {
            logger.info(`200 - Helpful count increased. Username: ${req.body.username}`);
            return res.status(200).json({msg: "Ok"});
        })
        .catch((err) => {
            logger.error(`500 - Helpful count not increased. Username: ${req.body.username}`);
            return res.json({ status: 500, msg: "Bad" });
        });
});



module.exports = router;


