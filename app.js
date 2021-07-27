const express = require('express');
const logger = require('./utils/logger');
const { PORT, DB_URL } = require("./configs/config");

// Get authentication middleware
const Authentication = require("./middlewares/authentication");
const authentication = new Authentication();
const mongoose = require("mongoose");


const usersRouter = require('./routes/users');
const reviewsRouter = require('./routes/reviews')


var app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Here I will check for tokens in the body of every request except /getCourses
app.use(async (req, res, next) => {
  console.log("headers", req.headers.authorization);
  console.log("url", req.url)
  if (
      req.url === "/login" ||
      req.url === "/register"
  ) {
    console.log("log in or register")
    return next();
  }
  if (!req.headers.authorization && req.url !=="/addReview") {
    return next();
  }
  if (!req.headers.authorization  && req.url==="/addReview" ) {
    console.log("illegal review")
    return next({ status: 403, msg: "Unauthorised" });
  } else {
    const { status, msg } = await authentication.verifyJWT(
        req.headers.authorization.split(" ")[1]
        // req.cookies.jwt.split(" ")[1]
    );
    req.body = { ...req.body, ...msg };
    logger.info(`User: ${req.body.username}  - Email: ${req.body.email}, URL: ${req.url}, IP: ${req.ip} `)
    logger.info(`This is the body of this request ${JSON.stringify(req.body)}`)
    logger.info(`This is the query of this request ${JSON.stringify(req.query)}`)

    return next();

  }
});
// This is the next step in authorization, here we check if the user is authorised to the route
app.use(async (req, res, next) => {
  if (
      req.url === "/reviewHelpful" ||
      req.url === "/getSingleReview" ||
      req.url === "/getAllReviews" ||
      req.url === "/addReview" ||
      req.url === "/login" ||
      req.url === "/register" ||
      req.url === "/getAllUsers"
  ) {
    return next();
  }
});


app.use(usersRouter);
app.use(reviewsRouter);
// Error middleware
app.use((error, req, res, next) => {
  // There was an error in the route
  logger.error(`${req.body.username}: ${error.status || 500} ${error.msg || "Bad"}`)
  return res
      .status(error.status || 500)
      .json({ status: error.status || 500, err: error.msg || "Bad" });
});



mongoose
    .connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("Database connection successful");
      logger.info("Database connection successful")
      app.listen(PORT, () => {
        console.log(`Server Started on port ${PORT}`);
        logger.info(`Server Started on port ${PORT}`)
      });
    })
    .catch((err) => {
      console.log(err);
      console.log("Database connection failed");
      logger.error(`Database connection failed - ${err}`)
    });
