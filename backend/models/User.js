import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, enum: ["customer", "provider", "admin"], default: "customer" },
  location: String,
  profileImage: String,
}, { timestamps: true });
export default mongoose.model("User", userSchema);
