import express from "express";
import Service from "../models/Service.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
const router = express.Router();
const wrap = (fn) => async (req, res) => { try { await fn(req, res); } catch (e) { res.status(400).json({ message: e.message }); } };
const pop = (q) => q.populate("provider", "name email phone location").populate("category", "name description");
const own = async (req) => { const s = await Service.findById(req.params.id); if (!s) return null; if (req.user.role !== "admin" && String(s.provider) !== String(req.user._id)) throw new Error("Not your service"); return s; };

router.get("/", wrap(async (req, res) => {
  const { category, q } = req.query, f = {};
  if (category) f.category = category;
  if (q) f.title = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  res.json(await pop(Service.find(f).sort("-createdAt")));
}));
router.get("/mine", authMiddleware, roleMiddleware("provider", "admin"), wrap(async (req, res) => res.json(await pop(Service.find({ provider: req.user._id })))));
router.get("/:id", wrap(async (req, res) => { const s = await pop(Service.findById(req.params.id)); s ? res.json(s) : res.status(404).json({ message: "Service not found" }); }));
router.post("/", authMiddleware, roleMiddleware("provider", "admin"), wrap(async (req, res) => {
  const { category, title, description, price, location } = req.body;
  res.status(201).json({ service: await Service.create({ category, title, description, price, location, provider: req.user._id }) });
}));
router.put("/:id", authMiddleware, roleMiddleware("provider", "admin"), wrap(async (req, res) => {
  const s = await own(req); if (!s) return res.status(404).json({ message: "Service not found" });
  const { category, title, description, price, location, availability } = req.body;
  Object.assign(s, JSON.parse(JSON.stringify({ category, title, description, price, location, availability })));
  res.json({ service: await s.save() });
}));
router.delete("/:id", authMiddleware, roleMiddleware("provider", "admin"), wrap(async (req, res) => {
  const s = await own(req); if (!s) return res.status(404).json({ message: "Service not found" });
  await s.deleteOne(); res.json({ message: "Deleted" });
}));
export default router;
