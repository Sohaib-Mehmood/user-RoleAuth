const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const teacherController = require("../controllers/teacherController");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");

router.get("/exam-details/:examId", teacherController.getExamDetails);
router.get("/all-exams", teacherController.getAllExams);

router.post(
  "/create-exam",
  [
    auth,
    checkRole("Teacher"),
    check("title", "Title is required").notEmpty(),
    check("subject", "Subject is required").notEmpty(),
    check("startDate", "Start date is required").notEmpty(),
    check("expiryDate", "Expiry date is required").notEmpty(),
  ],
  teacherController.createExam
);

router.post(
  "/add-question/:examId",
  [
    auth,
    checkRole("Teacher"),
    check("questionText", "Question text is required").notEmpty(),
    check("options", "Options are required").isArray({ min: 1 }),
    check("correctAnswer", "Correct answer is required").notEmpty(),
    check("score", "Score is required").isNumeric(),
  ],
  teacherController.addQuestion
);

router.delete(
  "/remove-question/:examId/:questionId",
  [auth, checkRole("Teacher")],
  teacherController.removeQuestion
);

router.get(
  "/review-exam-outcomes",
  [auth, checkRole("Teacher")],
  teacherController.reviewExamOutcomes
);

router.put(
  "/schedule-exam/:examId",
  [auth, checkRole("Teacher")],
  teacherController.scheduleExam
);

router.put(
  "/request-approval/:examId",
  [auth, checkRole("Teacher")],
  teacherController.requestExamApproval
);

router.post(
  "/login-teacher",
  [
    check("email", "Email is required").isEmail(),
    check("password", "Password is required").notEmpty(),
  ],
  teacherController.loginTeacher
);

module.exports = router;
