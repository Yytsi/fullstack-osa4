const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user.js')
const Blog = require('../models/blog.js')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).select('username name _id').populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })
  response.json(users)
})

usersRouter.get('/:id', async (request, response) => {
  const user = await User.findById(request.params.id).populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })
  response.json(user)
})

usersRouter.post('/', async (request, response, next) => {
  const body = request.body

  if (!body.password || body.password.length < 3) {
    return response.status(400).json({ error: 'Password must be at least 3 characters long' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const firstBlog = await Blog.findOne({}).populate('user', { username: 1, name: 1 })

  console.log(firstBlog)

  const newUser = new User({
    username: body.username,
    name: body.name,
    passwordHash: passwordHash,
    blogs: firstBlog ? [firstBlog._id] : []
  })

  const savedUser = await newUser.save()

  await User.populate(savedUser, { path: 'blogs', select: { title: 1, author: 1, url: 1, likes: 1 } })

  response.status(201).json(savedUser)
})



module.exports = usersRouter