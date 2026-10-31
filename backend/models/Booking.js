import mongoose from "mongoose";
const R = mongoose.Schema.Types.ObjectId;
const s = new mongoose.Schema({
  customer: { type: R, ref: "User", required: true },
  provider: { type: R, ref: "User", required: true },
  service: { type: R, ref: "Service", required: true },
  bookingDate: { type: Date, required: true },
  address: { type: String, required: true },
  notes: { type: String, default: "" },
  status: { type: String, enum: ["pending", "accepted", "rejected", "completed"], default: "pending" },
  reviewed: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.model("Booking", s);
