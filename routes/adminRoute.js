const express = require("express");
const router = express.Router();
const { notLoggedIn, notAdmin } = require("../middleware");
const User = require("../model/user");
const passport = require("passport");

router.get("/", notLoggedIn, notAdmin, async (req, res) => {
  var residentCount = 0;
  const householdCount = await User.count();
  const registrees = await User.find();
  for (registree of registrees) {
    if (!registree.answeredCensus) {
      residentCount += 1;
    } else {
      residentCount += registree.household.length + 1;
    }
  }
  res.render("admin/index", {
    title: "Dashboard || Barangay Mag-Asawang Sapa",
    householdCount,
    residentCount,
  });
});

router.get("/household", notLoggedIn, notAdmin, async (req, res) => {
  const users = await User.find();
  res.render("admin/household", {
    title: "All Households || Barangay Mag-Asawang Sapa",
    users,
  });
});

router.get("/household/:id", notLoggedIn, notAdmin, async (req, res) => {
  const { id } = req.params;
  const registree = await User.findById(id);
  console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  console.log(registree);
  res.render("admin/specificHousehold", {
    title: `${registree.firstName}'s Household || Barangay Mag-Asawang Sapa`,
    registree,
  });
});

router.delete("/household/:id", notLoggedIn, notAdmin, async (req, res) => {
  const { id } = req.params;
  const deletedRegistree = await User.findByIdAndDelete(id);
  console.log(deletedRegistree);
  req.flash("success", "Successfully Deleted a Household!!");
  res.redirect("/admin/household");
});

router.post(
  "/login",
  (req, res, next) => {
    req.body.username = req.body.username.toLowerCase();
    next();
  },
  passport.authenticate("admin", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  async (req, res) => {
    req.flash("success", "Welcome Back, Admin!");
    res.redirect("/admin/");
  }
);

module.exports = router;
