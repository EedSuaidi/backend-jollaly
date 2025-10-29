import prisma from "../config/prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";

// getAllnotes,
export const getAllNotes = async (req, res) => {
  const userId = req.user?.id;
  const notes = await prisma.note.findMany({ where: { userId } });
  return successResponse(res, "Get all notes successful!", notes);
};

// getnote,
export const getNote = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const note = await prisma.note.findFirst({ where: { id, userId } });

  if (!note) {
    return errorResponse(res, "Note is not found!", null, 404);
  } else {
    return successResponse(res, "Get note by ID successful!", note);
  }
};

// createnote,
export const createNote = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user?.id;

  if (!title && !content)
    return errorResponse(res, "Data cannot be empty!", null, 401);

  const note = await prisma.note.create({
    data: { title, content, userId },
  });

  return successResponse(res, "Note created!", note);
};

// updatenote,
export const updateNote = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const userId = req.user?.id;

  if (!title && !content)
    return errorResponse(res, "Data cannot be empty!", null, 401);

  // Ensure the note belongs to the authenticated user
  const existing = await prisma.note.findFirst({ where: { id, userId } });
  if (!existing) return errorResponse(res, "Note is not found!", null, 404);

  const note = await prisma.note.update({
    where: { id },
    data: { title, content },
  });

  return successResponse(res, "note updated!", note);
};

// deletenote,
export const deletenote = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  // Ensure the note belongs to the authenticated user
  const existing = await prisma.note.findFirst({ where: { id, userId } });
  if (!existing) return errorResponse(res, "Note is not found!", null, 404);

  const note = await prisma.note.delete({
    where: { id },
  });

  return successResponse(res, "Note deleted!", note);
};
