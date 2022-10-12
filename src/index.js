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
}))

/* notifies console when someone connects to server socket */
io.on('connection', (socket) => { 
  console.log('A user connected', socket.handshake.address);
});

/* Shows input page on root */
app.get('/', (req, res) => {
    res.render("input")
})

/* Shows output page on /output */
app.get("/output", (req, res) => {
  res.render("output", {status: status})
})


/* Handles a POST request to /sendinput */
let status = []
app.post("/sendinput", (req, res) => {
  let date = new Date()
  let cDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
    
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

