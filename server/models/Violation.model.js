// server/models/Violation.model.js
import mongoose from "mongoose";

const violationSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
  },
  warningCount: {
    type: Number,
    default: 0,
  },
  message: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Violation = mongoose.model("Violation", violationSchema);

export default Violation;
