import { addRatings } from "./seed-db";

try {
  addRatings().then(() => {
    process.exit(0);
  });
} catch {
  process.exit(1);
}
