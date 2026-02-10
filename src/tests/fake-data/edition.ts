export const fakeEdition = {
  _id: "fakeId1",
  title: "fakeTitle1",
  cover: "fakeCover1",
  book: "fakeBookId1",
  description: "fakeDescription1",
  published: new Date("2020-01-01").toISOString(),
  pagesCount: 100,
  format: "fakeFormat1",
  ISBN: "123456",
  ASIN: "ABCD1234",
  language: "fakeLanguage1",
};

export const fakeEdition2 = {
  _id: "fakeId2",
  title: "fakeTitle2",
  cover: "fakeCover2",
  book: "fakeBookId2",
  description: "fakeDescription2",
  published: new Date("2020-02-02").toISOString(),
  pagesCount: 200,
  format: "fakeFormat2",
  ISBN: "234567",
  ASIN: "ABCD2345",
  language: "fakeLanguage2",
};

export const fakeEditionsList = [fakeEdition, fakeEdition2];

export const getEditionsPage = (limit?: number, page?: number) => {
  return !limit || !page
    ? fakeEditionsList
    : fakeEditionsList.slice(
        (page - 1) * limit,
        (page - 1) * limit + limit + 1,
      );
};
