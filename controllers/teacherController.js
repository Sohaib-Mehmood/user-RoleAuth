const jwt = require("jsonwebtoken");
const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Result = require("../models/Result");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

exports.createExam = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, subject, startDate, expiryDate } = req.body;

  //below 2 lines are for debugging only
  const teacher = req.user.userId;
  console.log("Teacher ID:", teacher);

  try {
    const newExam = new Exam({
      title,
      subject,
      startDate,
      expiryDate,
      teacher,
    });
    await newExam.save();

    res
      .status(201)
      .json({ message: "Exam created successfully", exam: newExam });
  } catch (error) {
    console.error("err-message", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.addQuestion = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { examId } = req.params;
  const { questionText, options, correctAnswer, score } = req.body;
  console.log("Exam ID:", examId);

  try {
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const question = new Question({
      questionText,
      options,
      correctAnswer,
      score,
      exam: examId,
    });

    await question.save();

    exam.questions.push(question);
    await exam.save();

    res.status(201).json({ message: "Question added successfully", question });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getExamDetails = async (req, res) => {
  const { examId } = req.params;

  try {
    const exam = await Exam.findById(examId)
      .populate("questions")
      .populate("teacher", "name");

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const examDetails = {
      examId: exam._id,
      examName: exam.title,
      examSubject: exam.subject,
      teacherName: exam.teacher.name,
      teacherId: exam.teacher._id,
      questions: exam.questions,
    };

    res.status(200).json({ examDetails });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a list of all approved exams
exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find({ isApproved: true })
      .populate("questions")
      .populate("teacher", "name");
    res.status(200).json({ exams });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.removeQuestion = async (req, res) => {
  const { examId, questionId } = req.params;

  try {
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    await Question.findByIdAndDelete(questionId);
    exam.questions.pull(questionId);
    await exam.save();

    res.status(200).json({ message: "Question removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.reviewExamOutcomes = async (req, res) => {
  const teacherId = req.user.id;

  try {
    const exams = await Exam.find({ teacher: teacherId });
    const examIds = exams.map((exam) => exam._id);
    const results = await Result.find({ exam: { $in: examIds } }).populate(
      "exam student"
    );
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.scheduleExam = async (req, res) => {
  const { examId, startDate, expiryDate } = req.body;

  try {
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    exam.startDate = startDate;
    exam.expiryDate = expiryDate;
    await exam.save();

    res.status(200).json({ message: "Exam scheduled successfully", exam });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.requestExamApproval = async (req, res) => {
  const { examId } = req.params;

  try {
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    exam.isApprovalRequested = true;
    await exam.save();

    res.status(200).json({ message: "Approval requested", exam });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.loginTeacher = async (req, res) => {
  const { email, password } = req.body;

  try {
    const teacher = await User.findOne({ email, role: "Teacher" });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, teacher.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: teacher.id, role: teacher.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Logged in successfully", token, teacher });
  } catch (error) {
    //added this line for the debugging purpose
    console.error("Error in loginTeacher:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
