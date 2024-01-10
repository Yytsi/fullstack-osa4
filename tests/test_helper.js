const Blog = require('../models/blog.js')

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

const notesInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs, notesInDb
}