import mongoose from "mongoose";
const R = mongoose.Schema.Types.ObjectId;
const s = new mongoose.Schema({
  customer: { type: R, ref: "User", required: true },
  provider: { type: R, ref: "User", required: true },
  service: { type: R, ref: "Service", required: true },
  booking: { type: R, ref: "Booking", required: true, unique: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
}, { timestamps: true });
export default mongoose.model("Review", s);
