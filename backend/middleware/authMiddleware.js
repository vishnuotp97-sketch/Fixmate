import jwt from "jsonwebtoken";
import User from "../models/User.js";
export const authMiddleware = async (req, res, next) => {
  try {
    const h = req.headers.authorization;
    if (!h || !h.startsWith("Bearer ")) return res.status(401).json({ message: "Authentication required" });
    const decoded = jwt.verify(h.split(" ")[1], process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
