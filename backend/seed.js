// Run once: npm run seed  -> creates categories, an admin and a demo provider with services
import dotenv from "dotenv"; import bcrypt from "bcryptjs"; import mongoose from "mongoose";
import User from "./models/User.js"; import Category from "./models/Category.js"; import Service from "./models/Service.js";
dotenv.config(); await mongoose.connect(process.env.MONGO_URI);
const cats = [["Electrician","⚡","Wiring, fittings, repairs"],["Plumber","🔧","Leaks, pipes, taps"],["Carpenter","🪚","Furniture and woodwork"],["Painter","🎨","Interior and exterior"],["AC Repair","❄️","Service and gas refill"],["Appliance Repair","🧺","Washers, fridges, ovens"],["Cleaner","🧹","Home deep cleaning"]];
const C = {}; for (const [name, icon, description] of cats) C[name] = await Category.findOneAndUpdate({ name }, { name, icon, description }, { upsert: true, new: true });
const pw = await bcrypt.hash("password123", 10);
await User.updateOne({ email: "admin@fixmate.com" }, { $setOnInsert: { name: "Admin", email: "admin@fixmate.com", password: pw, role: "admin" } }, { upsert: true });
const p = await User.findOneAndUpdate({ email: "pro@fixmate.com" }, { $setOnInsert: { name: "Demo Pro", email: "pro@fixmate.com", password: pw, role: "provider", location: "Kochi", phone: "9999999999" } }, { upsert: true, new: true });
if (!(await Service.countDocuments())) await Service.insertMany([["Electrician","Home wiring & repairs",350],["Plumber","Leak & tap fixing",300],["Carpenter","Furniture repair",450],["Painter","Room painting (per room)",1800],["AC Repair","AC service & gas check",600]].map(([c,title,price]) => ({ provider: p._id, category: C[c]._id, title, description: `Professional ${title.toLowerCase()} by verified experts, at your doorstep.`, price, location: "Kochi" })));
console.log("Seeded. admin@fixmate.com / pro@fixmate.com — password: password123"); process.exit(0);
