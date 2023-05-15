const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");

router.get("/is-login", auth, (req, res) => {
  res.status(200).json({ message: "User is logged in" });
});

router.post(
  "/register-user",
  [
    auth,
    checkRole("Admin"),
    check("name", "Name is required").notEmpty(),
    check("email", "Email is required").isEmail(),
    check("password", "Password is required").notEmpty(),
    check("role", "Role is required").notEmpty(),
  ],
  adminController.registerUser
);

router.post(
  "/signup-admin",
  [
    check("name", "Name is required").notEmpty(),
    check("email", "Email is required").isEmail(),
    check("password", "Password is required").notEmpty(),
  ],
  adminController.registerAdmin
);

router.post(
  "/login-admin",
  [
    check("email", "Email is required").isEmail(),
    check("password", "Password is required").notEmpty(),
  ],
  adminController.loginAdmin
);

router.put("/approve-exam", checkRole("Admin"), adminController.approveExam);

router.delete(
  "/cancel-exam/:examId",
  [auth, checkRole("Admin")],
  adminController.cancelExam
);

router.get(
  "/review-exam-outcomes",
  [auth, checkRole("Admin")],
  adminController.reviewExamOutcomes
);

router.get(
  "/student-exam/:studentId",
  [auth, checkRole("Admin")],
  adminController.viewStudentExam
);

module.exports = router;
