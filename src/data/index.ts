import * as readline from "node:readline";
import { seedDB } from "./seed-db";
import { cleanUpDB } from "./clean-db";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const statement =
  "Select one of the following options:\n1. seed DB\n2. clean DB\n3. exit\n";

const showDBHelpers = () => {
  rl.question(statement, async (choice) => {
    switch (choice) {
      case "1":
        await seedDB();
        break;

      case "2":
        await cleanUpDB();
        break;

      case "3":
        process.exit(0);

      default:
        console.log("Invalid Option, try again");
        break;
    }
    showDBHelpers();
  });
};

showDBHelpers();
