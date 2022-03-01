const express = require('express')
const path = require('path')
const { db } = require('./DB')

const PORT = 3000

const server = express()

server.set('view engine', 'hbs')
server.set('views', path.join(__dirname, 'src', 'views'))

server.use(express.urlencoded({ extended: true }))

server.get('/', (request, response) => {
  const usersQuery = request.query
  let peopleForRender = db.people

  if (usersQuery.limit !== undefined && Number.isNaN(+usersQuery.limit) === false) {
    peopleForRender = db.people.slice(0, usersQuery.limit)
  } else
  if (usersQuery.reverse !== undefined && usersQuery.reverse === 'true') {
    peopleForRender = db.people.reverse()
  }

  response.render('main', { listOfPeople: peopleForRender })
})

server.post('/addressbook', (req, res) => {
  const dataFromForm = req.body

  db.people.push(dataFromForm)

  res.redirect('/')
})

server.get('*', (req, res) => {
  res.render('404')
})

server.listen(PORT, () => {
  console.log(`Server has been started on port: ${PORT}`)
})
