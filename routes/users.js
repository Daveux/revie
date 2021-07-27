const Authentication = require("../middlewares/authentication");
const authentication = new Authentication();
const logger = require('../utils/logger');
const mongoose = require("mongoose");

const express = require("express"),
    router = express.Router(),
    User = require("../models/Users"),
    Review = require("../models/Reviews"),
    passport = require("passport"),
    LocalStrategy = require("passport-local");

router.use(passport.initialize());

passport.use(
    new LocalStrategy((name, password, done) => {
      User.findOne({ name }, (user, err) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false);
        }
        if (!user.validPassword(password)) {
          return done(null, false);
        }
        return done(null, user);
      });
    })
);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* GET users listing. */
router.get('/getAllUsers', async function(req, res) {
    await User.find().populate('review')
        .then(users => {
            return res.status(200).json({ status: 200, msg: users });
        })
        .catch(() => {
            return res.status(500).json({ status: 500, msg: "Users not returned successfully" });
        })
});

router.post(
    "/register",
    async (req, res, next) => {
        const review = new Review({
            _id: new mongoose.Types.ObjectId(),
            video: ""
        })
        review.save()
            .then(() => {
                logger.info(`200 - Review created successfully.`);
            })
            .catch(() => {
                logger.error(`500 - Could not create review. `);
            })
      logger.info(`User to be registered - ${JSON.stringify(req.body.user)}. Username: ${req.body.user.username}`);
        console.log("review", review);
        const { status, msg } = await authentication.createJWT({
            username: req.body.user.username,
            reviewId: review._id
        });
        if (status === 200) {
            logger.info(`200 - JWT created successfully.`);
        } else {
            logger.error(`500 - Could not create JWT. `);
        }
      await User.register(
          new User({
            firstName: req.body.user.firstName,
            lastName: req.body.user.lastName,
            username: req.body.user.username,
            email: req.body.user.email,
            review: review._id
          }),
          req.body.user.password,
          (err, user) => {
            // console.log("User", user, "Error", err);
            if (err) {
              logger.error(`500 - Could not register user. Username: ${req.body.user.username} `);
              return res.json({ status: 500, msg: "Could not register user" });
            } else {
              // res.json(user);
              logger.info(`200 - User registered successfully. Username: ${req.body.user.username}`);
              return res.status(200).json({ status: 200, msg: "User registered successfully" });
            }
          }
      );

    }
);

router.post("/login", async (req, res, next) => {
  // console.log(user);
  // Create JWT for user

  passport.authenticate("local", (err, user, info) => {
    console.log("User", user);
    if (err) {
      logger.error(`500 - Error logging in. Username: ${req.body.username} `);
      return res.json({ status: 500, msg: "Bad" });
    }
    if (!user) {
      logger.error(`401 - Wrong username or password. Username: ${req.body.username} `);
      return res.json({ status: 401, msg: "Wrong username or password" });
    }
    req.logIn(user, async (err) => {
      const { status, msg } = await authentication.createJWT({
        username: req.user.username,
        email: req.user.email,
        reviewId: req.user.review
      });
      if (status === 200) {
        console.log("Logged in");
        logger.info(`200 - You are Logged In!. Username: ${req.body.username}`);
        return res.status(200).json({ status, msg });
      } else {
        // return next({ status: 500, msg: "Bad" });
        logger.error(`500 - Could not create token. Username: ${req.body.username} `);
        return res.json({ status: 500, msg: "Could not create token" });
      }
    });
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();
  logger.info(`Logged Out!. Username: ${req.body.username}`);
  res.json({ message: "Logged Out!" });
});

module.exports = router;



