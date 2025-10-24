export const fakeAuthor = {
  name: "fakeName",
  profilePic: "fakeProfilePic",
  description: "fakeDescription",
};

export const fakeAuthor2 = {
  name: "fakeName2",
  profilePic: "fakeProfilePic2",
  description: "fakeDescription2",
};

export const fakeAuthorsList = [fakeAuthor, fakeAuthor2];

export const getAuthorsPage = (limit?: number, page?: number) => {
  return !limit || !page
    ? fakeAuthorsList
    : fakeAuthorsList.slice((page - 1) * limit, (page - 1) * limit + limit + 1);
};
