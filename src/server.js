import dotenv from "dotenv";
dotenv.config();
if (process.env.HOST_URL == undefined) {
  throw "HOST_URL is required as a variable in .env (eg. HOST_URL=http://localhost:3000/)";
}
const dev = process.env.NODE_ENV !== "production";

import express from "express";
import bodyParser from "body-parser";
import next from "next";
import http from "http";
import { Server as SocketServer } from "socket.io";

const server = express();
const http_server = http.createServer(server);
const io = new SocketServer(http_server);

const nextApp = next({ dev });

nextApp.prepare().then(async () => {
  /* Set up body-parser */
  server.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  server.use(express.json());

  /* Required for socker server to work with API routes */
  server.use((req, res, _next) => {
    req.io = io;
    _next();
  });

  server.use((req, res, next) => {
    res.status(502).sendFile(__dirname, "error.html");
  });

  /* Handle all requests through next */
  server.use((req, res) => nextApp.getRequestHandler()(req, res));

  /* Listen on port 8000 */
  http_server.listen(8000, (err) => {
    if (err) throw err;
    console.log("Server is running on port 8000");
  });
});
