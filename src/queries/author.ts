import { REGEX_QUERY } from "./global";

export const AUTHOR_NAME_REGEX_QUERY = (authorName: string) => ({
  name: REGEX_QUERY(authorName, "i"),
});
