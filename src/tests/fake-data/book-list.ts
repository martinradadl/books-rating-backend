export const fakeBookList = {
  _id: "fakeId1",
  title: "fakeBookListTitle",
  description: "fakeBookListDescription",
  books: ["fakeBookId1", "fakeBookId2"],
};

export const fakeBookList2 = {
  _id: "fakeId2",
  title: "fakeBookListTitle2",
  description: "fakeBookListDescription2",
  books: ["fakeBookId3", "fakeBookId4"],
};

const fakeBookListWithToObject = {
  toObject: () => ({
    _id: "fakeId1",
    title: "fakeBookListTitle",
    description: "fakeBookListDescription",
    books: ["fakeBookId1", "fakeBookId2"],
  }),
};

const fakeBookListWithToObject2 = {
  toObject: () => ({
    _id: "fakeId2",
    title: "fakeBookListTitle2",
    description: "fakeBookListDescription2",
    books: ["fakeBookId3", "fakeBookId4"],
  }),
};

export const fakeListOfAllBookLists = [fakeBookList, fakeBookList2];

export const fakeListOfAllBookListsWithToObject = [
  fakeBookListWithToObject,
  fakeBookListWithToObject2,
];

export const fakeListOfAllBookListsWithURL = fakeListOfAllBookLists.map(
  (bookList) => ({
    ...bookList,
    urlPath: bookList.title.toLowerCase().replace(/\s+/g, "-"),
  }),
);

export const fakeListOfAllBookListsWithURLAndToObject =
  fakeListOfAllBookListsWithToObject.map((bookList) => ({
    ...bookList.toObject(),
    urlPath: bookList.toObject().title.toLowerCase().replace(/\s+/g, "-"),
  }));

export const getBookListsPage = (limit?: number, page?: number) => {
  return !limit || !page
    ? fakeListOfAllBookLists
    : fakeListOfAllBookLists.slice(
        (page - 1) * limit,
        (page - 1) * limit + limit + 1,
      );
};

export const getBookListsPageWithToObject = (limit?: number, page?: number) => {
  return !limit || !page
    ? fakeListOfAllBookListsWithToObject
    : fakeListOfAllBookListsWithToObject.slice(
        (page - 1) * limit,
        (page - 1) * limit + limit + 1,
      );
};

export const fakeBooksCountAggregateResult = [
  {
    _id: fakeBookList._id,
    booksCount: 2,
  },
  {
    _id: fakeBookList2._id,
    booksCount: 4,
  },
];

export const fakeBooksCountMap = new Map([
  [
    fakeBooksCountAggregateResult[0]._id,
    fakeBooksCountAggregateResult[0].booksCount,
  ],
  [
    fakeBooksCountAggregateResult[1]._id,
    fakeBooksCountAggregateResult[1].booksCount,
  ],
]);
