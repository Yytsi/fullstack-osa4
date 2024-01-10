const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper.js')
const app = require('../app.js')
const api = supertest(app)

const Blog = require('../models/blog.js')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('working with initial blogs', () => {
  test('blogs are returned as json', async () => {
    const response = await api.get('/api/blogs')
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toContain('application/json')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('blogs have id field', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
  })

  test('adding a blog', async () => {
    const newBlog = {
      title: 'UusiBlogi',
      author: 'Uusi kirjoittaja',
      url: 'https://www.kuusi.com/kuusi-blogi',
      likes: 11
    }

    await api.post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfter = await helper.notesInDb()
    expect(blogsAfter).toHaveLength(helper.initialBlogs.length + 1)
    expect(blogsAfter.map(blog => blog.title)).toContain('UusiBlogi')
  })

  test('adding a blog without likes field', async () => {
    const newBlog = {
      title: 'AgainUusiBlogi',
      author: 'New blogger once again',
      url: 'https://www.kuusi.com/uudempi-blogi',
    }

    await api.post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfter = await helper.notesInDb()
    expect(blogsAfter).toHaveLength(helper.initialBlogs.length + 1)
    expect(blogsAfter.map(blog => blog.title)).toContain('AgainUusiBlogi')
    expect(blogsAfter.find(blog => blog.title === 'AgainUusiBlogi').likes).toBe(0)
  })

  test('adding a blog without title and url fields', async () => {
    const newBlog = {
      author: 'Yet New blogger once again'
    }

    await api.post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAfter = await helper.notesInDb()
    expect(blogsAfter).toHaveLength(helper.initialBlogs.length)
  })

  test('deleting a blog', async () => {
    const blogsBefore = await helper.notesInDb()
    const blogToDelete = blogsBefore[0]
    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

    const blogsAfter = await helper.notesInDb()
    expect(blogsAfter).toHaveLength(helper.initialBlogs.length - 1)
    expect(blogsAfter.map(blog => blog.title)).not.toContain(blogToDelete.title)
  })

  test('deleting invalid blog', async () => {
    const invalidId = await helper.nonExistingId()
    await api.delete(`/api/blogs/${invalidId}`).expect(400)
  })

  test('updating a blog', async () => {
    const blogsBefore = await helper.notesInDb()
    const blogToUpdate = blogsBefore[0]

    const updatedBlog = {
      title: blogToUpdate.title,
      author: blogToUpdate.author,
      url: blogToUpdate.url,
      likes: blogToUpdate.likes + 1
    }

    await api.put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAfter = await helper.notesInDb()
    expect(blogsAfter).toHaveLength(helper.initialBlogs.length)
    expect(blogsAfter.find(blog => blog.id === blogToUpdate.id).likes).toBe(blogToUpdate.likes + 1)
  })

  test('updating invalid blog', async () => {
    const invalidId = await helper.nonExistingId()
    await api.put(`/api/blogs/${invalidId}`).expect(404)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})