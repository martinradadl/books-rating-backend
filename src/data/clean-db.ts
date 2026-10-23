import * as userModel from "../models/user";
import * as authorModel from "../models/author";
import * as genreModel from "../models/genre";
import * as characterModel from "../models/character";
import * as settingModel from "../models/setting";
import * as bookModel from "../models/book";
import * as editionModel from "../models/edition";
import * as bookListModel from "../models/book-list";
import * as ratingModel from "../models/rating";
import { initMongo } from "../mongo-setup";

const deleteAllUsers = async () => {
  try {
    console.info("Deleting Users...");
    const wereElementsDeleted = await userModel.User.collection.drop();
    console.info("succeed? " + wereElementsDeleted);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

const deleteAllAuthors = async () => {
  try {
    console.info("Deleting Authors...");
    const wereElementsDeleted = await authorModel.Author.collection.drop();
    console.info("succeed? " + wereElementsDeleted);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

const deleteAllGenres = async () => {
  try {
    console.info("Deleting Genres...");
    const wereElementsDeleted = await genreModel.Genre.collection.drop();
    console.info("succeed? " + wereElementsDeleted);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

const deleteAllCharacters = async () => {
  try {
    console.info("Deleting Characters...");
    const wereElementsDeleted =
      await characterModel.Character.collection.drop();
    console.info("succeed? " + wereElementsDeleted);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

const deleteAllSettings = async () => {
  try {
    console.info("Deleting Settings...");
    const wereElementsDeleted = await settingModel.Setting.collection.drop();
    console.info("succeed? " + wereElementsDeleted);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

const deleteAllBooks = async () => {
  try {
    console.info("Deleting Books...");
    const wereElementsDeleted = await bookModel.Book.collection.drop();
    console.info("succeed? " + wereElementsDeleted);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

const deleteAllEditions = async () => {
  try {
    console.info("Deleting Editions...");
    const wereElementsDeleted = await editionModel.Edition.collection.drop();
    console.info("succeed? " + wereElementsDeleted);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

const deleteAllBookLists = async () => {
  try {
    console.info("Deleting Book Lists...");
    const wereElementsDeleted = await bookListModel.BookList.collection.drop();
    console.info("succeed? " + wereElementsDeleted);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

const deleteAllRatings = async () => {
  try {
    console.info("Deleting Ratings...");
    const wereElementsDeleted = await ratingModel.Rating.collection.drop();
    console.info("succeed? " + wereElementsDeleted);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

export const cleanUpDB = async () => {
  try {
    console.info("Initializing connection with Mongo");
    await initMongo().catch(console.dir);
    await deleteAllUsers();
    await deleteAllAuthors();
    await deleteAllGenres();
    await deleteAllCharacters();
    await deleteAllSettings();
    await deleteAllBooks();
    await deleteAllEditions();
    await deleteAllBookLists();
    await deleteAllRatings();
    console.info("All collections have been cleaned");
  } catch (err: unknown) {
    if (err instanceof Error)
      console.error("Process has failed: ", err.message);
  }
};
