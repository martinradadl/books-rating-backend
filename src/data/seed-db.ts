import authors from "./authors.json";
import genres from "./genres.json";
import characters from "./characters.json";
import settings from "./settings.json";
import books from "./books.json";
import editions from "./editions.json";
import * as authorModel from "../models/author";
import * as genreModel from "../models/genre";
import * as characterModel from "../models/character";
import * as settingModel from "../models/setting";
import * as bookModel from "../models/book";
import * as editionModel from "../models/edition";
import { Types } from "mongoose";
import { initMongo } from "../mongo-setup";

const addAuthors = async () => {
  const addedAuthors = await authorModel.Author.insertMany(authors);
  console.log(`${addedAuthors.length} authors successfully added`);
  return addedAuthors;
};

const addGenres = async () => {
  const addedGenres = await genreModel.Genre.insertMany(genres);
  console.log(`${addedGenres.length} genres successfully added`);
  return addedGenres;
};

const addCharacters = async () => {
  const addedCharacters = await characterModel.Character.insertMany(characters);
  console.log(`${addedCharacters.length} characters successfully added`);
  return addedCharacters;
};

const addSettings = async () => {
  const addedSettings = await settingModel.Setting.insertMany(settings);
  console.log(`${addedSettings.length} settings successfully added`);
  return addedSettings;
};

const addBooks = async () => {
  const addedAuthors = await addAuthors();
  const addedGenres = await addGenres();
  const addedCharacters = await addCharacters();
  const addedSettings = await addSettings();

  const addedAuthorsIds = addedAuthors.reduce<{
    [key: string]: Types.ObjectId;
  }>((acc, author) => {
    acc[author.name] = author._id;
    return acc;
  }, {});

  const addedGenresIds = addedGenres.reduce<{
    [key: string]: Types.ObjectId;
  }>((acc, genre) => {
    acc[genre.name] = genre._id;
    return acc;
  }, {});

  const addedcharacters = addedCharacters.reduce<{
    [key: string]: Types.ObjectId;
  }>((acc, character) => {
    acc[character.name] = character._id;
    return acc;
  }, {});

  const addedSettingsIds = addedSettings.reduce<{
    [key: string]: Types.ObjectId;
  }>((acc, setting) => {
    acc[setting.name] = setting._id;
    return acc;
  }, {});

  const parsedBooks = books.map((book) => ({
    originalTitle: book.originalTitle,
    author: addedAuthorsIds[book.authorName],
    relatedGenres: book.relatedGenresNames.map((name) => addedGenresIds[name]),
    firstPublished: book.firstPublished,
    characters: book.charactersNames.map((name) => addedcharacters[name]),
    setting: book.settingsNames.map((name) => addedSettingsIds[name]),
  }));

  const addedBooks = await bookModel.Book.insertMany(parsedBooks);
  console.log(`${addedBooks.length} books successfully added`);
  return addedBooks;
};

const addEditions = async () => {
  const addedBooks = await addBooks();

  const addedBooksIds = addedBooks.reduce<{
    [key: string]: Types.ObjectId;
  }>((acc, book) => {
    acc[book.originalTitle] = book._id;
    return acc;
  }, {});

  const parsedEditions = editions.map((edition) => ({
    ...edition,
    book: addedBooksIds[edition.bookOriginalTitle],
    bookOriginalTitle: undefined,
  }));

  const addedEditions = await editionModel.Edition.insertMany(parsedEditions);
  console.log(`${addedEditions.length} editions successfully added`);
  return addedEditions;
};

export const seedDB = async () => {
  try {
    console.info("Initializing connection with Mongo");
    await initMongo().catch(console.dir);
    await addEditions();
    console.info("All data has been added");
  } catch (err: unknown) {
    if (err instanceof Error)
      console.error("Process has failed: ", err.message);
  }
};
