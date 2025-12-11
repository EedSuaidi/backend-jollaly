import prisma from "../config/prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";

// getAllnotes,
export const getAllNotes = async (req, res) => {
  const userId = req.user?.id;
  // Support optional query filters: ?isFavorite=true&isArchived=false
  const { isFavorite, isArchived } = req.query;
  const where = { userId };

  if (typeof isFavorite !== "undefined") {
    // Convert query string to boolean
    if (isFavorite === "true" || isFavorite === true) where.isFavorite = true;
    else if (isFavorite === "false" || isFavorite === false)
      where.isFavorite = false;
  }
  if (typeof isArchived !== "undefined") {
    if (isArchived === "true" || isArchived === true) where.isArchived = true;
    else if (isArchived === "false" || isArchived === false)
      where.isArchived = false;
  }

  const notes = await prisma.note.findMany({ where });
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
  const { title, content, isFavorite, isArchived } = req.body;
  const userId = req.user?.id;

  if (!title && !content)
    return errorResponse(res, "Data cannot be empty!", null, 401);

  // Normalize booleans with defaults to false if not provided
  const favorite =
    typeof isFavorite === "boolean" ? isFavorite : isFavorite === "true";
  const archived =
    typeof isArchived === "boolean" ? isArchived : isArchived === "true";

  const note = await prisma.note.create({
    data: {
      title,
      content,
      userId,
      isFavorite: !!favorite,
      isArchived: !!archived,
    },
  });

  return successResponse(res, "Note created!", note);
};

// updatenote,
export const updateNote = async (req, res) => {
  const { id } = req.params;
  const { title, content, isFavorite, isArchived } = req.body;
  const userId = req.user?.id;

  if (
    !title &&
    !content &&
    typeof isFavorite === "undefined" &&
    typeof isArchived === "undefined"
  )
    return errorResponse(res, "Data cannot be empty!", null, 401);

  // Ensure the note belongs to the authenticated user
  const existing = await prisma.note.findFirst({ where: { id, userId } });
  if (!existing) return errorResponse(res, "Note is not found!", null, 404);

  const data = {};
  if (typeof title !== "undefined") data.title = title;
  if (typeof content !== "undefined") data.content = content;
  if (typeof isFavorite !== "undefined") {
    const favorite =
      typeof isFavorite === "boolean" ? isFavorite : isFavorite === "true";
    data.isFavorite = !!favorite;
  }
  if (typeof isArchived !== "undefined") {
    const archived =
      typeof isArchived === "boolean" ? isArchived : isArchived === "true";
    data.isArchived = !!archived;
  }

  const note = await prisma.note.update({
    where: { id },
    data,
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
