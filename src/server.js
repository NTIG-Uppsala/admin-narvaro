import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import next from 'next';
import http from 'http';
import bodyParser from 'body-parser';
import { Server as SocketServer } from 'socket.io'

import Database from './libs/Database.js';
import apiRouter from './routes/api.js';

const database_instance = new Database();
database_instance.print_uris()

const server = express();
const http_server = http.createServer(server);
const io = new SocketServer(http_server);

const dev = process.env.NODE_ENV !== 'production'

const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()

if (process.env.HOST_URL == undefined) {
    throw "HOST_URL is required as a variable in .env (eg. HOST_URL=http://localhost:3000/)";
}

nextApp.prepare().then(async () => {

    /* Set up body-parser */
    server.use(bodyParser.urlencoded({
        extended: true
    }));

    server.use(express.json());

    server.use((req, res, callback) => {
        req.io = io;
        callback();
    });

    /* API router */
    server.use('/api', apiRouter);

    /* Handle all requests through next */
    server.get("*", (req, res) => {
        return nextHandler(req, res)
    });

    /* Listen on port 8000 */
    http_server.listen(8000, (err) => {
        if (err) throw err
        console.log("Server is running on port 8000")
    });
});
