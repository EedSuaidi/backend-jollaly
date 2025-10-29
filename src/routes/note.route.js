import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  getAllNotes,
  getNote,
  createNote,
  updateNote,
  deletenote,
} from "../controllers/note.controller.js";

const router = express.Router();

// Protect all note routes
router.use(verifyToken);

router.get("/", getAllNotes);
router.get("/:id", getNote);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deletenote);

export default router;
