import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();
const sign = (u) => jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
const safe = (u) => { const o = u.toObject(); delete o.password; return o; };

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, location, role } = req.body;
    if (!name || !email || !password || password.length < 6) return res.status(400).json({ message: "Name, email and a password of 6+ characters are required" });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: "User already exists" });
    const user = await User.create({
      name, email, phone, location,
      role: role === "provider" ? "provider" : "customer", // admins are never self-assigned
      password: await bcrypt.hash(password, 10),
    });
    res.status(201).json({ message: "Registered successfully", user: safe(user), token: sign(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user || !(await bcrypt.compare(password || "", user.password))) return res.status(401).json({ message: "Invalid email or password" });
    res.json({ message: "Login successful", user: safe(user), token: sign(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get("/me", authMiddleware, (req, res) => res.json(req.user));
export default router;
