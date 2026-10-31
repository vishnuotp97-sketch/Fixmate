import mongoose from "mongoose";
const R = mongoose.Schema.Types.ObjectId;
const s = new mongoose.Schema({
  provider: { type: R, ref: "User", required: true },
  category: { type: R, ref: "Category", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  location: { type: String, required: true },
  availability: { type: Boolean, default: true },
}, { timestamps: true });
export default mongoose.model("Service", s);
