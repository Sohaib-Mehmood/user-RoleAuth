const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Exam = require("../models/Exam");
const Result = require("../models/Result");
const bcrypt = require("bcrypt");

async function generateSalt() {
  const salt = await bcrypt.genSalt(10);
  return salt;
}

exports.registerAdmin = async (req, res) => {
  console.log(req.body);
  const { name, email, password } = req.body;
  console.log(name, email, password);

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const salt = await generateSalt();

    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "Admin",
    });
    console.log("Saving user:", user);
    await user.save();

    console.log("User saved successfully:", user);

    res.status(201).json({ message: "Admin registered successfully", user });
  } catch (error) {
    console.error("Error in registerAdmin:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.registerUser = async (req, res) => {
  const { role, name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash the password before saving the user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ role, name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully", newUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.approveExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    exam.isApproved = true;
    exam.approvedBy = req.user.userId; // Add the admin ID from the JWT token
    await exam.save();

    res.status(200).json({ message: "Exam approved", exam });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.cancelExam = async (req, res) => {
  const { examId } = req.params;

  try {
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (new Date() >= exam.startDate) {
      return res
        .status(400)
        .json({ message: "Cannot cancel exam after its starting time" });
    }

    await Exam.findByIdAndDelete(examId);

    res.status(200).json({ message: "Exam canceled" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.reviewExamOutcomes = async (req, res) => {
  try {
    const results = await Result.find({}).populate("exam student");
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.viewStudentExam = async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await User.findById(studentId);
    if (!student || student.role !== "Student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const exams = await Exam.find({}).populate("questions");
    res.status(200).json({ exams });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await User.findOne({ email, role: "Admin" });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: admin.id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    //for checking if it is passing the correct token.
    console.log("Generated token:", token);

    res.status(200).json({ message: "Logged in successfully", token, admin });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
