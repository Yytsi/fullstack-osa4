const blogsRouter = require('express').Router()
const Blog = require('../models/blog.js')
const User = require('../models/user.js')

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

blogsRouter.post('/', async (request, response, next) => {
  const blog = new Blog(request.body)

  if (!blog.title || !blog.url) {
    return response.status(400).end()
  }

  if (!blog.likes) {
    blog.likes = 0
  }

  const firstUser = await User.findOne({})

  if (firstUser) {
    blog.user = firstUser._id
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
  response.status(204).end()
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