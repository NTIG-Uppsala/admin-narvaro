const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 8000
let status = []

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.use(bodyParser.urlencoded({
  extended: true
}))

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
  try {
    console.log(req.body.inputfield)
    date = new Date()
    Cdate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`

    status.push({
      status_text: req.body.inputfield,
      current_hour: Cdate
    })

    console.log(status)
  } catch (error) {

  }
  
  res.redirect("/")
})

app.listen(port, () => {
    console.log(`Närvaroadmin körs på port ${port}`)
})