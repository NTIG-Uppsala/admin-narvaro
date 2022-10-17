const express = require('express')
const next = require('next')
const bodyParser = require('body-parser');

const server = express()
const http_server = require('http').Server(server);
const io = require('socket.io')(http_server);

const dev = process.env.NODE_ENV !== 'production'

const nextApp = next({dev})
const nextHandler = nextApp.getRequestHandler()


let moment = require('moment');

moment.locale('sv')


/* Function which returns the current date in preferred format */
const current_date = () => {
    return new Date()
    // return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${((date.getMinutes() < 10) ? '0' : '') + date.getMinutes()}:${((date.getSeconds() < 10) ? '0' : '') + date.getSeconds()}`
}

/* Handles a POST request to /sendinput */
let statusArray = [
    {
        name: "Mathias Laveno",
        role: "Rektor",
        locked: false,
        status: false,
        latest_change: current_date(),
        latest_change_from_now: null
    },
    {
        name: "Henrik Jonsson",
        role: "biträdande rektor",
        locked: false,
        status: false,
        latest_change: current_date(),
        latest_change_from_now: null
    },
    {
        name: "Sarah Hagberg",
        role: "Biträdande rektor",
        locked: false,
        status: false,
        latest_change: current_date(),
        latest_change_from_now: null
    },
    {
        name: "Therese Ekman",
        role: "Administratör",
        locked: false,
        status: false,
        latest_change: current_date(),
        latest_change_from_now: null
    },
    {
        name: "Vincent Persson",
        role: "Tekniker",
        locked: false,
        status: false,
        latest_change: current_date(),
        latest_change_from_now: null
    },
    {
        name: "Megan Gallagher Sundström",
        role: "Kurator",
        locked: false,
        status: false,
        latest_change: current_date(),
        latest_change_from_now: null

    }
]

nextApp.prepare().then(() => {
    server.use(bodyParser.urlencoded({
        extended: true
    }));

    setInterval(function(){
        statusArray.forEach(item => {
            item.latest_change_from_now = moment(item.latest_change).fromNow()
        });
    }, 1000);


    server.get('/api/getstatus', (req, res) => {
        res.json(statusArray)
    })
    
    server.get("*", (req, res) => {
        return nextHandler(req, res)
    })

    http_server.listen(8000, (err) => console.log("Server is running on port 8000") )
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
                status_object["latest_change_from_now"] = moment(status_object["latest_change"]).fromNow()
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
