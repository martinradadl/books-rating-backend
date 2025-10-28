export const fakeEdition = {
  title: "fakeTitle1",
  bookId: "fakeBookId",
  ISBN: "123456",
};

export const fakeEdition2 = {
  title: "fakeTitle2",
  bookId: "fakeBookId",
  ISBN: "654321",
};

export const fakeEditionsList = [fakeEdition, fakeEdition2];

export const getEditionsPage = (limit?: number, page?: number) => {
  return !limit || !page
    ? fakeEditionsList
    : fakeEditionsList.slice(
        (page - 1) * limit,
        (page - 1) * limit + limit + 1
      );
};
