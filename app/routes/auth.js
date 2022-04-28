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
        
        const newUser =  new User({
            username: req.body.username,
            password: hashPassword
        })
    
        const user = await newUser.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json(error);
    }

})

module.exports = router;