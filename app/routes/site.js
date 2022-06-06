const User = require("../models/User");
const express = require("express");
const router = express.Router();

//Register
router.get("/signup", async (req, res) => {
    try {
        if (!req.session.isAuth || req.session.isAuth === undefined) {
            res.sendFile('register.html', {
                root: "src/pages/register"
            });
        } else {
            res.redirect("/");
        }
    } catch (error) {
        res.status(500).json(error);
    }
})

//Login
router.get("/login", async (req, res) => {
    try {
        if (!req.session.isAuth || req.session.isAuth === undefined) {
            res.sendFile('login.html', {
                root: "src/pages/login"
            });
        } else {
            res.redirect("/");
        }
    } catch (error) {
        res.status(500).json(error);
    }
})

//Homepage
router.get("/", async (req, res) => {
    try {
        if (req.session.isAuth) {
            res.sendFile('homepage.html', {
                root: "src/pages/home"
            });
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        res.status(500).json(error);
    }
})

//Play (OFF)
router.get("/game-alone", async (req, res) => {
    try {
        if (req.session.isAuth) {
            res.sendFile('playoffline.html', {
                root: "src/pages/game"
            });
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        res.status(500).json(error);
    }
})

//Play (ON)
router.get("/game", async (req, res) => {
    try {
        if (req.session.isAuth) {
            res.sendFile('index.html', {
                root: "src/pages/game"
            });
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        res.status(500).json(error);
    }
})

//Play (ON)
router.get("/room", async (req, res) => {
    try {
        if (req.session.isAuth) {
            res.sendFile('room.html', {
                root: "src/pages/room"
            });
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        res.status(500).json(error);
    }
})

//Play (ON)
router.get("/top-score", async (req, res) => {
    try {
        if (req.session.isAuth) {
            res.sendFile('rank.html', {
                root: "src/pages/rank"
            });
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = router;