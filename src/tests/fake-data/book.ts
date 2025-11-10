export const fakeBook = {
  originalTitle: "fakeOriginalTitle1",
  authorId: "fakeAuthorId",
  relatedGenres: ["fakeGenre1Id", "fakeGenre2Id"],
  firstPublished: new Date("2020-01-01").toISOString(),
  settings: ["fakeSetting1", "fakeSetting2"],
  characters: ["fakeCharacter1", "fakeCharacter2"],
};

export const fakeBook2 = {
  originalTitle: "fakeOriginalTitle2",
  authorId: "fakeAuthorId",
  relatedGenres: ["fakeGenre3Id", "fakeGenre4Id"],
  firstPublished: new Date("2020-02-02").toISOString(),
  settings: ["fakeSetting3", "fakeSetting4"],
  characters: ["fakeCharacter3", "fakeCharacter4"],
};

export const fakeBooksList = [fakeBook, fakeBook2];

export const getBooksPage = (limit?: number, page?: number) => {
  return !limit || !page
    ? fakeBooksList
    : fakeBooksList.slice((page - 1) * limit, (page - 1) * limit + limit + 1);
};
