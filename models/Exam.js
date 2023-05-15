const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const examSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  questions: [
    {
      type: Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  startDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  isApprovalRequested: {
    type: Boolean,
    default: false,
  },
});

module.exports = Exam = mongoose.model("Exam", examSchema);
