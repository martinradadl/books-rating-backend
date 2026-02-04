import { addBookLists } from "./seed-db";

try {
  addBookLists().then(() => {
    process.exit(0);
  });
} catch (error) {
  process.exit(1);
}
