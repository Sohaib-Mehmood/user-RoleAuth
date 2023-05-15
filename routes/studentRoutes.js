const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const studentController = require("../controllers/studentController");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");

router.get(
  "/active-exams",
  [auth, checkRole("Student")],
  studentController.viewActiveExams
);

router.get(
  "/take-exam/:examId",
  [auth, checkRole("Student")],
  studentController.takeExam
);

router.post(
  "/submit-exam/:examId",
  [
    auth,
    checkRole("Student"),
    check("answers", "Answers array is required").isArray({ min: 1 }),
  ],
  studentController.submitExam
);

router.get(
  "/exam-result/:examId",
  [auth, checkRole("Student")],
  studentController.viewExamResult
);

router.post(
  "/login-student",
  [
    check("email", "Email is required").isEmail(),
    check("password", "Password is required").notEmpty(),
  ],
  studentController.loginStudent
);

module.exports = router;
