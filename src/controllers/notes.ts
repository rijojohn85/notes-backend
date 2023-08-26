import { RequestHandler } from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import NoteModel from "../models/note";
import { assertIsDefined } from "../util/assertIsDefined";

export const getNotes: RequestHandler = async (req, res, next) => {
  const authenicatedUserId = req.session.userId;
  try {
    assertIsDefined(authenicatedUserId);
    const notes = await NoteModel.find({ userid: authenicatedUserId }).exec();
    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
};

export const getNote: RequestHandler = async (req, res, next) => {
  const authenicatedUserId = req.session.userId;
  const noteId = req.params.noteId;
  try {
    assertIsDefined(authenicatedUserId);
    if (!mongoose.isValidObjectId(noteId)) {
      throw createHttpError(400, "Invalid ID Format");
    }
    const note = await NoteModel.findById(noteId).exec();
    if (!note) {
      throw createHttpError(404, "Note not found");
    }
    if (!note.userid.equals(authenicatedUserId)) {
      throw createHttpError(401, "Not authorised.");
    }
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};
interface CreateNoteBody {
  title?: string;
  text?: string;
}
export const createNote: RequestHandler<
  unknown,
  unknown,
  CreateNoteBody,
  unknown
> = async (req, res, next) => {
  const title = req.body.title;
  const text = req.body.text;
  const authenicatedUserId = req.session.userId;
  try {
    if (!title) {
      assertIsDefined(authenicatedUserId);
      throw createHttpError(400, "Note must have a title");
    }
    const newNote = await NoteModel.create({
      userid: authenicatedUserId,
      title: title,
      text: text,
    });
    res.status(201).json(newNote);
  } catch (error) {
    next(error);
  }
};

interface UpdateNoteParam {
  noteId: string;
}

interface UpdateNoteBody {
  title?: string;
  text?: string;
}
export const updateNote: RequestHandler<
  UpdateNoteParam,
  unknown,
  UpdateNoteBody,
  unknown
> = async (req, res, next) => {
  const noteId = req.params.noteId;
  const newTitle = req.body.title;
  const newText = req.body.text;
  const authenicatedUserId = req.session.userId;

  try {
    assertIsDefined(authenicatedUserId);
    if (!mongoose.isValidObjectId(noteId)) {
      throw createHttpError(400, "Invalid ID Format");
    }
    if (!newTitle) {
      throw createHttpError(400, "Note must have a title");
    }
    const note = await NoteModel.findById(noteId).exec();
    if (!note) {
      throw createHttpError(404, "Note not found");
    }
    if (!note.userid.equals(authenicatedUserId)) {
      throw createHttpError(401, "Not authorised.");
    }
    note.title = newTitle;
    note.text = newText;

    const updatedNote = await note.save();
    res.status(200).json(updatedNote);
  } catch (error) {
    next(error);
  }
};

export const deleteNote: RequestHandler = async (req, res, next) => {
  const noteId = req.params.noteId;
  const authenicatedUserId = req.session.userId;
  try {
    assertIsDefined(authenicatedUserId);
    if (!mongoose.isValidObjectId(noteId)) {
      throw createHttpError(400, "Invalid ID Format");
    }
    const note = await NoteModel.findById(noteId).exec();
    if (!note) {
      throw createHttpError(404, "Note not found");
    }
    if (!note.userid.equals(authenicatedUserId)) {
      throw createHttpError(401, "Not authorised.");
    }
    await note.deleteOne();
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
