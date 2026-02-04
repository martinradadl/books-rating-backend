import { addBookLists } from "./seed-db";

try {
  addBookLists().then(() => {
    process.exit(0);
  });
} catch (_) {
  process.exit(1);
}
