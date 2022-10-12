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
        title: "Rektor",
        locked: false,
        status: null
    },
    {
        name: "Henrik Jonsson",
        title: "biträdande rektor",
        locked: false,
        status: null
    },
    {
        name: "Sara Hagberg",
        title: "biträdande rektor",
        locked: false,
        status: null
    },
    {
        name: "Maud Enbom",
        title: "Skolsköterska",
        locked: false,
        status: null
    },
    {
        name: "Therese Ekman",
        title: "Administratör",
        locked: false,
        status: null
    },
    {
        name: "Vincent Persson",
        title: "Tekniker",
        locked: false,
        status: null
    },
    {
        name: "Megan Gallagher Sundström",
        title: "Kurator",
        locked: false,
        status: null
    }
]

/* notifies console when someone connects to server socket */
io.on('connection', (socket) => { 
  console.log('A user connected', socket.handshake.address);
  /* A event for changes to the input */
  socket.on('status change', (dataArray) => { 
    console.log("STATUS CHANGE")
    
    let date = new Date()

    let latest_change = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${((date.getMinutes() < 10) ? '0' : '') + date.getMinutes()}`
    // dataArray["latest_change"] = latest_change
    status = dataArray
    console.log(dataArray)
    /* Status change */
    io.emit("status update", dataArray)

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

app.post("/sendinput", (req, res) => {
  let date = new Date()
  let cDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${((date.getMinutes() < 10) ? '0' : '') + date.getMinutes()}`
    
  let content = {
      status_text: req.body.inputfield,
      current_date: cDate
  }

  try {
    //  Check if input is empty
    if (req.body.inputfield.length < 1) {
        // just return to the input page
        return res.redirect('/')
    }

    //  Add the content to the status array
    status.push(content)
    
    //  Send the content to the client socket
    try {
      io.emit("status update", content)
    } catch (error) {
      throw error
    }  

  } catch (error) {
    throw error
  }
  console.log(status)
  return res.redirect("/")
})


const serverPort = 8000
server.listen(serverPort, () => {
    console.log(`Närvaroadmin körs på port ${serverPort}`)
})

