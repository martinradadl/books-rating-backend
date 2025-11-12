import bodyParser from "body-parser";
import express from "express";
import http from "http";
import cors from "cors";
import { initMongo } from "./mongo-setup";
import authors from "./routes/author";
import books from "./routes/book";
import editions from "./routes/edition";
import genres from "./routes/genre";
import settings from "./routes/setting";
import characters from "./routes/character";

const jsonParser = bodyParser.json();

const app = express();
const httpServer = http.createServer(app);
const port = process.env.PORT || 3000;

initMongo().catch(console.dir);

app.use(jsonParser);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // APP_URL pending

app.get("/", (_, res) => res.send("Server is running"));

app.use("/authors", authors);
app.use("/books", books);
app.use("/editions", editions);
app.use("/genres", genres);
app.use("/settings", settings);
app.use("/characters", characters);

// Start the server and listen on the specified port
httpServer.listen(port, () => {
  // Log a message when the server is successfully running
  console.log(`Server is running on http://localhost:${port}`);
});

export const shutdownServer = (callback: (error?: Error) => void) =>
  httpServer && httpServer.close(callback);

module.exports = app;
