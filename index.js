
const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

const authRouter = require("./app/routes/auth");
const siteRouter = require("./app/routes/site");

mongoose.connect(process.env.DB_URL);

// app.use(express.static(__dirname + "/src"));

app.use(express.json());

app.use("/", siteRouter);

app.use("/auth", authRouter);

app.listen(3000, () => {
    console.log("Backend already!")
})