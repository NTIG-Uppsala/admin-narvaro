import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import next from 'next';
import bodyParser from 'body-parser';
import http from 'http';
import {Server as SocketServer} from 'socket.io'

import mongoose from 'mongoose';

import Database from './Database.js';
import apiRouter from './routes/api.js';

const database_instance = new Database();
const server = express();
const http_server = http.createServer(server);
const io = new SocketServer(http_server);

const dev = process.env.NODE_ENV !== 'production'

const nextApp = next({dev})
const nextHandler = nextApp.getRequestHandler()

nextApp.prepare().then( async () => {
    
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
    const database_url = (process.env.NODE_ENV == "production") ? process.env.MONGODB_URI : process.env.MONGODB_URI_DEV;
    mongoose.connect(database_url, (err) => {
        if (err) throw err;
        
        return console.log("Connected to database");
    });
    
});

/* notifies console when someone connects to server socket */
io.on('connection', (socket) => { 
    console.log('A user connected', socket.handshake.address);

    /* A event for changes to the status */
    socket.on('status change', async (response) => { 
        console.log(response)
        console.log("STATUS CHANGE")

        /* Update status of person in database */
        database_instance.update_user(response.id, {
            status: response.status, 
            latest_change: response.latest_change
        })
        .then((result) => {
            console.log("Updated user status, result ->", result)
            io.emit("status update")
        }).catch((err) => {
            console.log(err)
        });
        
    });

});