const jwt = require("jsonwebtoken");
const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Result = require("../models/Result");
const User = require("../models/User");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

exports.viewActiveExams = async (req, res) => {
  try {
    const exams = await Exam.find({ isApproved: true })
      .where("startDate")
      .lte(new Date())
      .where("expiryDate")
      .gte(new Date())
      .populate("questions");
    res.status(200).json({ exams });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.viewExamResult = async (req, res) => {
  const { examId } = req.params;
  const studentId = req.user.id;

  try {
    // Your logic for fetching and returning the exam result for the student
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.takeExam = async (req, res) => {
  const { examId } = req.params;
  const studentId = req.user.id;

  try {
    const exam = await Exam.findById(examId).populate("questions");
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const existingResult = await Result.findOne({
      exam: examId,
      student: studentId,
    });
    if (existingResult) {
      return res
        .status(400)
        .json({ message: "You have already taken this exam" });
    }
    res.status(200).json({ exam });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.submitExam = async (req, res) => {
  const { examId, answers } = req.body;
  const studentId = req.user.id;

  try {
    const exam = await Exam.findById(examId).populate("questions");
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    let score = 0;
    exam.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score += question.score;
      }
    });

    const result = new Result({ exam: examId, student: studentId, score });
    await result.save();

    res.status(200).json({ message: "Exam submitted successfully", result });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await User.findOne({ email, role: "Student" });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: student.id, role: student.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Logged in successfully", token, student });
  } catch (error) {
    console.error("Error in registerAdmin:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
