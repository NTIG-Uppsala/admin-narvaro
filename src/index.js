const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const { log } = require('console');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

/* Sets ejs as view engine */
app.set('view engine', 'ejs')

/* middleware */
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
  extended: true
}));

/* Function which returns the current date in preferred format */
const current_date = () => {
    let date = new Date()
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${((date.getMinutes() < 10) ? '0' : '') + date.getMinutes()}:${((date.getSeconds() < 10) ? '0' : '') + date.getSeconds()}`
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
        role: "Biträdande rektor",
        locked: false,
        status: false,
        latest_change: current_date()
    },
    {
        name: "Sara Hagberg",
        role: "Biträdande rektor",
        locked: false,
        status: false,
        latest_change: current_date()
    },
    {
        name: "Maud Enbom",
        role: "Skolsköterska",
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
        name: "Megan Sundström",
        role: "Kurator",
        locked: false,
        status: false,
        latest_change: current_date()
    }
]

/* notifies console when someone connects to server socket */
io.on('connection', (socket) => { 
  console.log('A user connected', socket.handshake.address);

  /* A event for changes to the status */
  socket.on('status change', (dataArray) => { 
    console.log("STATUS CHANGE")
    /* Update status array */
    for (const key in statusArray) {
        let index = key;
        let status_object = statusArray[key];

        for (const key in dataArray) {
            let key_name = key;
            let input_object = dataArray[key];
            
            /* Prevent duplicate names */
            if (status_object.name == input_object.name) {
                /* Only update if change */
                if (status_object.status != input_object.status) {
                    status_object.status = input_object.status;
                    status_object["latest_change"] = current_date();
                }

                if (status_object.locked != input_object.locked) {
                    status_object.locked = input_object.locked;
                }    
            }

            
        }
    }
    console.log(statusArray)
    /* Status change */
    io.emit("status update", statusArray)

  });

});

/* Shows input page on root */
app.get('/setstatus', (req, res) => {
    res.render("input", {statusObject: statusArray})
})

/* Shows output page on /output */
app.get("/", (req, res) => {
  res.render("output", {statusObject: statusArray})
})


const serverPort = 8000
server.listen(serverPort, () => {
    console.log(`Närvaroadmin körs på port ${serverPort}`)
})

