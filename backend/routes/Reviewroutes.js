import express from "express";
import mongoose from "mongoose";
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
const router = express.Router();
const wrap = (fn) => async (req, res) => { try { await fn(req, res); } catch (e) { res.status(400).json({ message: e.message }); } };
const list = (field) => wrap(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new Error("Invalid id");
  res.json(await Review.find({ [field]: req.params.id }).populate("customer", "name").sort("-createdAt"));
});
router.post("/create", authMiddleware, roleMiddleware("customer"), wrap(async (req, res) => {
  const { bookingId, rating, comment } = req.body;
  if (!mongoose.isValidObjectId(bookingId)) throw new Error("Invalid booking");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Rating must be 1 to 5");
  if (!comment?.trim()) throw new Error("Please add a comment");
  const b = await Booking.findOne({ _id: bookingId, customer: req.user._id });
  if (!b) throw new Error("Booking not found");
  if (b.status !== "completed") throw new Error("You can only review completed bookings");
  if (b.reviewed) throw new Error("Already reviewed");
  const review = await Review.create({ customer: req.user._id, provider: b.provider, service: b.service, booking: b._id, rating, comment: comment.trim() });
  b.reviewed = true; await b.save();
  res.status(201).json(review);
}));
router.get("/provider/:id", list("provider"));
router.get("/service/:id", list("service"));
export default router;
