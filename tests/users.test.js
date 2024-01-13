const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper.js')
const app = require('../app.js')
const api = supertest(app)

const User = require('../models/user.js')

beforeEach(async () => {
  await User.deleteMany({})
  await User.insertMany(helper.initialUsers)
})

describe('working with initial users', () => {
  describe('getting users', () => {
    test('users returned as json', async () => {
      const response = await api.get('/api/users')
      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toContain('application/json')
      expect(response.body).toHaveLength(helper.initialUsers.length)
    })
  })

  test('user with too short password is not added', async () => {
    const newUser = {
      username: 'invuser',
      name: 'Not Righty',
      password: '9'
    }

    await api.post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAfter = await helper.usersInDb()
    expect(usersAfter).toHaveLength(helper.initialUsers.length)
  })

  test('user with too short username is not added', async () => {
    const newUser = {
      username: 'in',
      name: 'Not Righty',
      password: '9abcdef'
    }

    await api.post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAfter = await helper.usersInDb()
    expect(usersAfter).toHaveLength(helper.initialUsers.length)
  })

  test('duplicate username is not added', async () => {
    const firstUser = helper.initialUsers[0]

    await api.post('/api/users')
      .send(firstUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAfter = await helper.usersInDb()
    expect(usersAfter).toHaveLength(helper.initialUsers.length)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})