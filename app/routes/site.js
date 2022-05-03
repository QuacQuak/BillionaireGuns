const User = require("../models/User");
const express = require("express");
const router = express.Router();

//Register
router.get("/register", async (req, res) => {
    try {
        res.sendFile('register.html', {
            root: "src/pages/register"
        });
    } catch (error) {
        res.status(500).json(error);
    }
})

//Login
router.get("/login", async (req, res) => {
    try {
        res.sendFile('login.html', {
            root: "src/pages/login"
        });
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = router;