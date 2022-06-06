const User = require("../models/User");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

//Register
router.post("/register", async (req, res) => {
    try {
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);

        const hashPassword = bcrypt.hashSync(req.body.password, salt);

        const newUser = new User({
            username: req.body.username,
            password: hashPassword
        })

        const user = await newUser.save();
        if (user) res.redirect("/login");
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json(error);
    }

})

//Login
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.body.username
        });

        !user && res.status(404).json("user not found");

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        !validPassword && res.status(400).json("wrong password")

        if (user && validPassword) {
            req.session.isAuth = true;
            req.session.username = req.body.username;
        }
        res.redirect("/");
        res.status(200).json(user)
    } catch (err) {
        res.status(500).json(err)
    }
});

//Log out
router.get("/logout", async (req, res) => {
    try {
        if (req.session) {
            // delete session object
            req.session.destroy(function (err) {
                if (err) {
                    return next(err);
                } else {
                    console.log(req.session);
                    return res.redirect('/login');
                }
            });
        }

        res.status(200);
    } catch (err) {
        res.status(500).json(err)
    }
});

//Save score
router.put("/score", async (req, res) => {
    if (req.session.isAuth) {
        try {
            const update = await User.findOne({
                username: req.session.username
            });

            const user = await User.findOneAndUpdate({
                username: req.session.username
            }, {
                $set: {
                    score: update.score + 1
                }
            }, {
                new: true
            });
            res.status(200).json("Account has been updated!");
        } catch (error) {
            return res.status(500).json(error);
        }

    } else {
        return res.status(403);
    }
});

module.exports = router;