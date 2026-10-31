import express from "express";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
const router = express.Router();
router.use(authMiddleware);
const wrap = (fn) => async (req, res) => { try { await fn(req, res); } catch (e) { res.status(400).json({ message: e.message }); } };
const pop = (q) => q.populate("service", "title price").populate("provider", "name phone").populate("customer", "name phone email").sort("-createdAt");

router.post("/", roleMiddleware("customer"), wrap(async (req, res) => {
  const { serviceId, bookingDate, address, notes } = req.body;
  if (!mongoose.isValidObjectId(serviceId)) throw new Error("Invalid service");
  const date = new Date(bookingDate);
  if (!bookingDate || Number.isNaN(date.getTime()) || date <= new Date()) throw new Error("Please choose a valid future date");
  if (!address?.trim()) throw new Error("Address is required");
  const s = await Service.findById(serviceId);
  if (!s) throw new Error("Service not found");
  if (!s.availability) throw new Error("This service is currently unavailable");
  const booking = await Booking.create({ customer: req.user._id, provider: s.provider, service: s._id, bookingDate: date, address: address.trim(), notes: notes || "" });
  res.status(201).json({ message: "Booking requested", booking });
}));
router.get("/customer", roleMiddleware("customer"), wrap(async (req, res) => res.json(await pop(Booking.find({ customer: req.user._id })))));
router.get("/provider", roleMiddleware("provider"), wrap(async (req, res) => res.json(await pop(Booking.find({ provider: req.user._id })))));

const transition = (from, to) => wrap(async (req, res) => {
  const b = await Booking.findOne({ _id: req.params.id, provider: req.user._id });
  if (!b) return res.status(404).json({ message: "Booking not found" });
  const next = to || req.body.status;
  if (!to && !["accepted", "rejected"].includes(next)) throw new Error("Status must be accepted or rejected");
  if (b.status !== from) throw new Error(`Only ${from} bookings can be changed this way`);
  b.status = next; res.json({ booking: await b.save() });
});
router.patch("/:id/respond", roleMiddleware("provider"), transition("pending"));
router.patch("/:id/complete", roleMiddleware("provider"), transition("accepted", "completed"));
export default router;
