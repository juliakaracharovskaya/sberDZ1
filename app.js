const express = require('express')
const bcrypt = require('bcrypt')
const path = require('path')
const hbs = require('hbs')
const sessions = require('express-session')
const { v4: uuidv4 } = require('uuid')
const { timingSafeEqual, sign } = require('crypto')
const { db } = require('./DB')
const { checkAuth } = require('./src/middlewares/checkAuth')

const PORT = process.env.PORT || 3000
const server = express()

const saltRounds = 10

server.set('view engine', 'hbs')
server.set('views', path.join(process.cwd(), 'src', 'views'))
server.set('cookieName', 'sid')
hbs.registerPartials(path.join(process.cwd(), 'src', 'views', 'partials'))

const secretKey = 'akasljdfalksdjfalskdljf'

server.use(express.urlencoded({ extended: true }))
server.use(express.json())
server.use(express.static('public'))
server.use(sessions({
  name: server.get('cookieName'),
  secret: secretKey,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 86400 * 1e3,
  },
}))

server.use((req, res, next) => {
  const currentEmail = req.session?.user?.email

  if (currentEmail) {
    const currentUser = db.users.find((user) => user.email === currentEmail)

    res.locals.name = currentUser.name
  }

  next()
})

server.get('/', checkAuth, (request, response) => {
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

server.delete('/post', (req, res) => {
  const userId = req.session?.user?.id // айди автора в сессии
  const { postId } = req.body // айди поста
  const rightId = db.people.find((el) => Number(el.postNumber) === Number(postId))
  if (rightId) {
    if (userId === rightId.imageId) {
      const newPeople = db.people.filter((el) => Number(el.postNumber) !== postId)
      db.people = newPeople

      return res.sendStatus(200)
    }
    return res.sendStatus(403)
  }
  return res.sendStatus(404)
})

server.get('/auth/signup', (req, res) => {
  res.render('signUp')
})

server.post('/auth/signup', async (req, res) => {
  const { name, email, password } = req.body
  const hashPass = await bcrypt.hash(password, saltRounds)
  const id = uuidv4()

  db.users.push({
    name,
    email,
    password: hashPass,
    id,
  })

  req.session.user = {
    email, id,
  }

  res.redirect('/')
})

server.get('/auth/signin', async (req, res) => {
  res.render('signIn')
})

server.post('/auth/signin', async (req, res) => {
  const { email, password } = req.body

  const currentUser = db.users.find((user) => user.email === email)

  if (currentUser) {
    if (await bcrypt.compare(password, currentUser.password)) {
      req.session.user = {
        email,
      }

      return res.redirect('/')
    }
  }

  return res.redirect('/auth/signin')
})

server.get('/auth/signout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.redirect('/')

    res.clearCookie(req.app.get('cookieName'))
    return res.redirect('/')
  })
})

server.post('/addressbook', (req, res) => {
  const dataFromForm = req.body

  db.people.push(dataFromForm)

  dataFromForm.imageId = req.session.user.id
  dataFromForm.postNumber = Date.now()

  res.redirect('/')
})

server.get('*', (req, res) => {
  res.render('404')
})

server.listen(PORT, () => {
  console.log(`Server has been started on port: ${PORT}`)
})
