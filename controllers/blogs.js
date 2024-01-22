const blogsRouter = require('express').Router()
const Blog = require('../models/blog.js')
const middleware = require('../utils/middleware.js')

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

blogsRouter.post('/', middleware.tokenExtractor, middleware.userExtractor, async (request, response, next) => {
  const blog = new Blog(request.body)

  console.log('request.body', request.body)
  console.log('request.user', request.user)
  console.log('blog', blog)

  if (!blog.title || !blog.url) {
    return response.status(400).end()
  }

  if (!blog.likes) {
    blog.likes = 0
  }

  if (request.user) {
    blog.user = request.user._id
    request.user.blogs = request.user.blogs.concat(blog._id)
    await request.user.save()
  } else {
    return response.status(400).send({ error: 'User not found with given ID' })
  }

  const savedBlog = await blog.save()

  if (blog.user) {
    await Blog.populate(savedBlog, { path: 'user', select: { username: 1, name: 1 } })
  }

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', middleware.tokenExtractor, middleware.userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(400).send('Blog not found with given ID')
  }

  if (blog.user.toString() !== request.user.id.toString()) {
    return response.status(401).send({ error: 'lack of authorization to delete this blog' })
  }

  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).json({ message: 'Blog deleted successfully' })
})

blogsRouter.put('/:id', middleware.tokenExtractor, middleware.userExtractor, async (request, response) => {
  const body = request.body

  const blogUpdate = {
    title: body.title,
    author: body.author,
    url: body.url
  }

  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).send({ error: 'Blog not found with given ID' })
  }

  if (!blogUpdate.title || !blogUpdate.url) {
    return response.status(400).end()
  }

  if (!body.likes) {
    blogUpdate.likes = 0
  } else {
    blogUpdate.likes = body.likes
  }

  console.log('blog.user', blog.user)
  console.log('request.user.id', request.user.id)

  if (blog.user.toString() !== request.user.id.toString()) {
    return response.status(401).send({ error: 'lack of authorization to update this blog' })
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blogUpdate, { new: true, runValidators: true, context: 'query' })

  if (updatedBlog) {
    response.json(updatedBlog)
  } else {
    response.status(404).send({ error: 'Blog not found with given ID' })
  }
})

module.exports = blogsRouter