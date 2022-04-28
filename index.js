const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

const authRouter = require("./app/routes/auth");

mongoose.connect(process.env.DB_URL);

app.use(express.json());

app.use("/auth", authRouter);

app.listen(3000, () => {
    console.log("Backend already!")
})