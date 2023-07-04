// const User = require("../models/User");
const express = require("express");
const router = express.Router();

// //Name
// router.get("/name", async (req, res) => {
//   try {
//     if (req.session.isAuth || true) {
//       const user = await User.findOne({
//         username: req.session.username,
//       });

//       res.json({
//         name: user.username,
//         score: user.score,
//       });
//     } else {
//       res.redirect("/login");
//     }
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

//Room
router.get("/room", async (req, res) => {
  try {
    if (req.session.isAuth || true) {
      res.json({
        room: global.room,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// //Get top
// router.get("/top", async (req, res) => {
//   try {
//     if (req.session.isAuth || true) {
//       const users = await User.find()
//         .sort({
//           score: -1,
//         })
//         .limit(10);

//       res.json({
//         users: users,
//       });
//     } else {
//       res.redirect("/login");
//     }
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

module.exports = router;
