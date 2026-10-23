import { DEFAULT_PROFILE_PIC } from "../../helpers/constants";

export const fakeUser = {
  _id: "fakeId",
  email: "fakeEmail@fakeDomain.com",
  name: "fakeName",
};

export const fakeUserWithDefaultProfilePic = {
  ...fakeUser,
  profilePic: DEFAULT_PROFILE_PIC,
};
