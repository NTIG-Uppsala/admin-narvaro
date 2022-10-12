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

/* Handles a POST request to /sendinput */
let status = [
    {
        name: "Mathias Laveno",
        role: "Rektor",
        locked: false,
        status: false
    },
    {
        name: "Henrik Jonsson",
        role: "biträdande rektor",
        locked: false,
        status: false
    },
    {
        name: "Sara Hagberg",
        role: "biträdande rektor",
        locked: false,
        status: false
    },
    {
        name: "Maud Enbom",
        role: "Skolsköterska",
        locked: false,
        status: false
    },
    {
        name: "Therese Ekman",
        role: "Administratör",
        locked: false,
        status: false
    },
    {
        name: "Vincent Persson",
        role: "Tekniker",
        locked: false,
        status: false
    },
    {
        name: "Megan Gallagher Sundström",
        role: "Kurator",
        locked: false,
        status: false
    }
]

/* notifies console when someone connects to server socket */
io.on('connection', (socket) => { 
  console.log('A user connected', socket.handshake.address);
  /* A event for changes to the input */
  socket.on('status change', (dataArray) => { 
    console.log("STATUS CHANGE")
    
    let date = new Date()

    let latest_change = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${((date.getMinutes() < 10) ? '0' : '') + date.getMinutes()}:${((date.getSeconds() < 10) ? '0' : '') + date.getSeconds()}`
    
    /* Update status array */
    for (const key in status) {
        let index = key;
        let status_object = status[key];

        for (const key in dataArray) {
            let key_name = key;
            let input_object = dataArray[key];
            
            if (status_object.name == input_object.name) {
                /* Only update if change */
                if (status_object.status != input_object.status) {
                    status_object.status = input_object.status;
                    status_object["latest_change"] = latest_change;
                }

                if (status_object.locked != input_object.locked) {
                    status_object.locked = input_object.locked;
                    status_object["latest_change"] = latest_change;
                }    
            }

            
        }
    }
    console.log(status)
    /* Status change */
    io.emit("status update", status)

  });

});

/* Shows input page on root */
app.get('/', (req, res) => {
    res.render("input", {statusObject: status})
})

/* Shows output page on /output */
app.get("/output", (req, res) => {
  res.render("output", {statusObject: status})
})


const serverPort = 8000
server.listen(serverPort, () => {
    console.log(`Närvaroadmin körs på port ${serverPort}`)
})

