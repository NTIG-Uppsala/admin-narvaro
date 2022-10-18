const express = require('express')
const next = require('next')
const bodyParser = require('body-parser');

const fs = require('fs');

const server = express()
const http_server = require('http').Server(server);
const io = require('socket.io')(http_server);

const dev = process.env.NODE_ENV !== 'production'

const nextApp = next({dev})
const nextHandler = nextApp.getRequestHandler()




/* Function which returns the current date in preferred format */
const current_date = () => {
    return new Date()
}

/* Handles a POST request to /sendinput */
let statusArray = [
    {
        name: "Mathias Laveno",
        role: "Rektor",
        locked: false,
        status: false,
        latest_change: current_date()
    },
    {
        name: "Henrik Jonsson",
        role: "biträdande rektor",
        locked: false,
        status: false,
        latest_change: current_date()
    },
    {
        name: "Sarah Hagberg",
        role: "Biträdande rektor",
        locked: false,
        status: false,
        latest_change: current_date()
    },
    {
        name: "Therese Ekman",
        role: "Administratör",
        locked: false,
        status: false,
        latest_change: current_date()
    },
    {
        name: "Vincent Persson",
        role: "Tekniker",
        locked: false,
        status: false,
        latest_change: current_date()
    },
    {
        name: "Megan Gallagher Sundström",
        role: "Kurator",
        locked: false,
        status: false,
        latest_change: current_date()
    }
]

nextApp.prepare().then(() => {
    /* Check if folder /data exists */
    if (!fs.existsSync('./data'))
        fs.mkdirSync('./data')

    /* Check if status.json exists */
    if (!fs.existsSync('./data/status.json'))
    {   
        /* Create file if not */
        fs.writeFileSync('./data/status.json', JSON.stringify(statusArray))
    } else {

        /* Read file if it does */
        statusArray = JSON.parse(fs.readFileSync('./data/status.json'))
    }
        
    /* Set up body-parser */
    server.use(bodyParser.urlencoded({
        extended: true
    }));

    /* API to retrive current status */
    server.get('/api/getstatus', (req, res) => {
        res.json(statusArray)
    });
    
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
    console.log('A user connected', socket.handshake.address);

    /* A event for changes to the status */
    socket.on('status change', (response) => { 
    console.log(response)
    console.log("STATUS CHANGE")
    /* Update status array */
    for (const key in statusArray) {
        let index = key;
        let status_object = statusArray[key];

        /* Prevent duplicate names */
        if (status_object.name == response.name) {
            /* Only update if change */
            if (status_object.status != response.status) {
                status_object.status = response.status;
                status_object["latest_change"] = current_date();
            }

            // if (status_object.locked != input_object.locked) {
            //     status_object.locked = input_object.locked;
            // }    
        }

            
    }
    console.log(statusArray)
    /* Status change */
    io.emit("status update", statusArray)
    
});

});
