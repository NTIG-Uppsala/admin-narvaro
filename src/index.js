const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const server = require('http').createServer(app);
const io = require('socket.io')(server);
let status = []

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.use(bodyParser.urlencoded({
  extended: true
}))

io.on('connection', () => { 
  console.log('A user connected');
});

app.get('/', (req, res) => {
    res.render("input")
  })
 
app.get('/input', (req, res) => {
  res.render("input")
})

app.get("/output", (req, res) => {
  res.render("output", {status: status})
})

app.post("/sendinput", (req, res) => {
  let date = new Date()
  let Cdate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
    
  let content = {
      status_text: req.body.inputfield,
      current_hour: Cdate
  }

  try {
    console.log(req.body.inputfield)
    if (req.body.inputfield.length < 0) {
        return res.redirect("/", {error: "Ett fel har inträffat. Vänligen försök igen :)"})
    }

    

    status.push(content)

    console.log(status)
  } catch (error) {
    return res.redirect("/", {error: "Ett fel har inträffat. Vänligen försök igen :)"})
  }
  
  try {
    io.emit("status update", content)
  } catch (error) {
    throw error
  }

  res.redirect("/")
})

const serverPort = 8000

server.listen(serverPort, () => {
    console.log(`Närvaroadmin körs på port ${serverPort}`)
})

