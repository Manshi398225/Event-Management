const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    status: {
      type: String,
      enum: ["registered", "approved", "rejected"],
      default: "registered",
    },
    ticketCode: {
      type: String,
      default: "",
    },
    qrCodeDataUrl: {
      type: String,
      default: "",
    },
    feedbackRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedbackComment: {
      type: String,
      trim: true,
      default: "",
    },
    feedbackSubmittedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);
