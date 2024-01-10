const blogsRouter = require('express').Router()
const Blog = require('../models/blog.js')

blogsRouter.get('/', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

blogsRouter.get('/:id', (request, response, next) => {
  Blog
    .findById(request.params.id)
    .then(blog => {
      if (blog) {
        response.json(blog)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

blogsRouter.post('/', (request, response, next) => {
  const blog = new Blog(request.body)

  if (!blog.title || !blog.url) {
    return response.status(400).end()
  }

  if (!blog.likes) {
    blog.likes = 0
  }

  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    }).catch(error => next(error))
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