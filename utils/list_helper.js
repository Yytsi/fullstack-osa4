const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  const maxLikes = Math.max(...blogs.map(blog => blog.likes))
  return blogs.find(blog => blog.likes === maxLikes)
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null
  const authorCount = new Map()
  blogs.forEach(blog => {
    const author = blog.author
    authorCount.set(author, (authorCount.get(author) || 0) + 1)
  })
  let [maxBlogs, mostBlogsAuthor] = [0, null]
  for (const [author, count] of authorCount) {
    if (count > maxBlogs) {
      maxBlogs = count
      mostBlogsAuthor = author
    }
  }
  return { author: mostBlogsAuthor, blogs: maxBlogs }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null
  const authorLikes = new Map()
  blogs.forEach(blog => {
    const author = blog.author
    authorLikes.set(author, (authorLikes.get(author) || 0) + blog.likes)
  })
  let [maxLikes, mostLikesAuthor] = [0, null]
  for (const [author, likes] of authorLikes) {
    if (likes > maxLikes) {
      maxLikes = likes
      mostLikesAuthor = author
    }
  }
  return { author: mostLikesAuthor, likes: maxLikes }
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}