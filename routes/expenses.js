import express from "express";
import Expense from "../models/Expense.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified.id;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};

// GET all expenses
router.get("/", auth, async (req, res) => {
  const expenses = await Expense.find({ user: req.user });
  res.json(expenses);
});

// ADD expense
router.post("/", auth, async (req, res) => {
  const { title, amount, category } = req.body;
  const expense = new Expense({ user: req.user, title, amount, category });
  await expense.save();
  res.json(expense);
});

// DELETE expense
router.delete("/:id", auth, async (req, res) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user });
  res.json(expense);
});

// UPDATE expense
router.put("/:id", auth, async (req, res) => {
  const { title, amount, category } = req.body;
  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, user: req.user },
    { title, amount, category },
    { new: true }
  );
  res.json(expense);
});

export default router;