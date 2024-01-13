const Blog = require('../models/blog.js')
const User = require('../models/user.js')
const bcrypt = require('bcrypt')

const initialBlogs = [
  {
    title: 'First Blog',
    author: 'Jaakko Kulta',
    url: 'https://www.hopea.com/first-blog',
    likes: 8
  },
  {
    title: 'Toinen blogi',
    author: 'Matti Meikäläinen',
    url: 'https://www.bronze.com/second-blog',
    likes: 5
  }
]

const initialUsers = [
  {
    username: 'tsts',
    name: 'Testing test',
    password: bcrypt.hashSync('akrobatia1', 10)
  },
  {
    username: 'tsts2',
    name: 'Tester test',
    password: bcrypt.hashSync('akrobatia2', 10)
  }
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon', author: 'Jaakko Kulta', url: 'https://www.hopea.com/first-blog', likes: 8 })
  await blog.save()
  await Blog.deleteOne({ _id: blog._id })

  return blog._id.toString()
}

const notesInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs, initialUsers, usersInDb, notesInDb, nonExistingId
}