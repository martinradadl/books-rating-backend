import bodyParser from "body-parser";
import express from "express";
import http from "http";
import cors from "cors";
import { initMongo } from "./mongo-setup";

const jsonParser = bodyParser.json();

const app = express();
const httpServer = http.createServer(app);
const port = process.env.PORT || 3000;

initMongo().catch(console.dir);

app.use(jsonParser);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // APP_URL pending

app.get("/", (_, res) => res.send("Server is running"));

// Start the server and listen on the specified port
httpServer.listen(port, () => {
  // Log a message when the server is successfully running
  console.log(`Server is running on http://localhost:${port}`);
});

export const shutdownServer = (callback: (error?: Error) => void) =>
  httpServer && httpServer.close(callback);

module.exports = app;
