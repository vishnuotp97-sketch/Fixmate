import express from "express";
import Category from "../models/Category.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
const router = express.Router();
const admin = [authMiddleware, roleMiddleware("admin")];
const wrap = (fn) => async (req, res) => { try { await fn(req, res); } catch (e) { res.status(e.code === 11000 ? 409 : 400).json({ message: e.code === 11000 ? "Category already exists" : e.message }); } };

router.get("/", wrap(async (_, res) => res.json(await Category.find().sort("name"))));
router.get("/:id", wrap(async (req, res) => { const c = await Category.findById(req.params.id); c ? res.json(c) : res.status(404).json({ message: "Category not found" }); }));
router.post("/", ...admin, wrap(async (req, res) => res.status(201).json({ category: await Category.create(req.body) })));
router.put("/:id", ...admin, wrap(async (req, res) => { const c = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); c ? res.json({ category: c }) : res.status(404).json({ message: "Category not found" }); }));
router.delete("/:id", ...admin, wrap(async (req, res) => { const c = await Category.findByIdAndDelete(req.params.id); c ? res.json({ message: "Deleted" }) : res.status(404).json({ message: "Category not found" }); }));
export default router;
