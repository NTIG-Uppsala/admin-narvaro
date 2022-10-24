import dotenv from 'dotenv'
dotenv.config()

import express from 'express'

import next from 'next';
import bodyParser from 'body-parser';
import http from 'http';


import {Server as SocketServer} from 'socket.io'


import Database from './Database.js';
const database_instance = new Database();

import mongoose from 'mongoose';

import apiRouter from './routes/api.js';


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

    mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASSWORD)}@admin-narvaro.o11easj.mongodb.net/users`, (err) => {
        if (err) throw err;
        
        return console.log("Connected to database");
    });
    
});

 



/* notifies console when someone connects to server socket */
io.on('connection', (socket) => { 
    console.log('A user connected', socket.handshake.address);

    /* A event for changes to the status */
    socket.on('status change', (response) => { 
        console.log(response)
        console.log("STATUS CHANGE")
        /* Update status array */

        
        database_instance.models.users.findOne({name: response.name }, (err, result) => { 
            if (err) throw err;

           if (result)  {
                result.status = response.status;
                result.latest_change = new Date();
                
                result.save((err) => {
                    if (err) throw err;
                    console.log("Updated in database")
                });
            }
            
            io.emit("status update")
            
        });

        /* Status change */
        
    });

});