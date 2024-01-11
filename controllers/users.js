const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user.js')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).select('username name _id')
  response.json(users)
})

usersRouter.get('/:id', async (request, response) => {
  const user = await User.findById(request.params.id).populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })
  response.json(user)
})

usersRouter.post('/', async (request, response, next) => {
  const body = request.body

  if (!body.password || body.password.length < 3) {
    return response.status(400).send('Password must be at least 3 characters long')
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const newUser = new User({
    username: body.username,
    name: body.name,
    passwordHash: passwordHash
  })

  const savedUser = await newUser.save()
  response.json(savedUser)
})



module.exports = usersRouter