import { addUsers } from "./seed-db";

try {
  addUsers().then(() => {
    process.exit(0);
  });
} catch {
  process.exit(1);
}
