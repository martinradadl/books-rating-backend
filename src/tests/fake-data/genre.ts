export const fakeGenre = {
  _id: "fakeId1",
  name: "fakeName1",
  description: "fake description 1",
};

export const fakeGenre2 = {
  _id: "fakeId2",
  name: "fakeName2",
  description: "fake description 2",
};

export const fakeGenresList = [fakeGenre, fakeGenre2];

export const fakeGenresListWithURL = fakeGenresList.map((genre) => ({
  _id: genre._id,
  name: genre.name,
  urlPath: genre.name.toLowerCase().replace(/\s+/g, "-"),
}));

export const getGenresPage = (limit?: number, page?: number) => {
  return !limit || !page
    ? fakeGenresList
    : fakeGenresList.slice((page - 1) * limit, (page - 1) * limit + limit + 1);
};
