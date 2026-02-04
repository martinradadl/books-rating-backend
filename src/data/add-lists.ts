import { addBookLists } from "./seed-db";

try {
  addBookLists().then(() => {
    process.exit(0);
  });
} catch {
  process.exit(1);
}
