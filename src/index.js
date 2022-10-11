const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 8000
let status = {

}
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
  console.log(req.body.inputfield)
  status[req.body.inputfield] = req.body.inputfield
  res.redirect("/")
})

app.listen(port, () => {
    console.log(`Närvaroadmin körs på port ${port}`)
})