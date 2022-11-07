import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import session from 'express-session'

import { v4 as uuidv4 } from 'uuid';
import next from 'next';
import http from 'http';
import bodyParser from 'body-parser';
import { Server as SocketServer } from 'socket.io'

import MongoStore from 'connect-mongo';

import Database, { database_url } from './Database.js';
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

    // https://github.com/expressjs/session
    let time_to_live = 1000 * 60 * 10; // 10 minutes
    server.use(session({
        store: MongoStore.create({
            mongoUrl: database_url,
            ttl: time_to_live,
        }),
        secret: process.env.SESSION_SECRET,
        genid: () => { return uuidv4() },
        saveUninitialized: true,
        resave: false,
        cookie: {
            secure: false,
            maxAge: time_to_live,
            sameSite: true
        }
    }))

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

/* notifies console when someone connects to server socket */
io.on('connection', (socket) => {
    /* A event for changes to the status */
    socket.on('status change', async (response) => {
        console.log(response)
        console.log("STATUS CHANGE")

        /* Update status of person in database */
        database_instance.update_user(response.id, {
            status: response.status,
            latest_change: new Date()
        })
            .then((result) => {
                console.log("Updated user status, result ->", result)
                io.emit("status update")
            }).catch((err) => {
                console.log(err)
            });

    });

});