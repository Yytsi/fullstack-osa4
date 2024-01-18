const blogsRouter = require('express').Router()
const Blog = require('../models/blog.js')
const User = require('../models/user.js')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', (request, response) => {
  Blog
    .find({})
    .populate('user', { username: 1, name: 1 })
    .then(blogs => {
      response.json(blogs)
    })
})

blogsRouter.get('/:id', (request, response, next) => {
  Blog
    .findById(request.params.id)
    .populate('user', { username: 1, name: 1 })
    .then(blog => {
      if (blog) {
        response.json(blog)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

const getTokenFrom = request => {
  const authorization = request.get('authorization')

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }

  return null
}

blogsRouter.post('/', async (request, response, next) => {
  const token = getTokenFrom(request)

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)
  const blog = new Blog(request.body)

  if (!blog.title || !blog.url) {
    return response.status(400).end()
  }

  if (!blog.likes) {
    blog.likes = 0
  }

  if (user) {
    blog.user = user._id
    user.blogs = user.blogs.concat(blog._id)
    await user.save()
  } else {
    return response.status(400).send({ error: 'User not found with given ID' })
  }

  const savedBlog = await blog.save()

  if (blog.user) {
    await Blog.populate(savedBlog, { path: 'user', select: { username: 1, name: 1 } })
  }

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(400).send('Blog not found with given ID')
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).json({ message: 'Blog deleted successfully' })
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blogUpdate = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blogUpdate, { new: true, runValidators: true, context: 'query' })

  if (updatedBlog) {
    response.json(updatedBlog)
  } else {
    response.status(404).send({ error: 'Blog not found with given ID' })
  }
})

module.exports = blogsRouter