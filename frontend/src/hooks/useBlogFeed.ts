'use client'

import { useEffect, useState } from 'react'
import { BLOG_FILTERS } from '@/lib/mock/publicBlogs.mock'
import { getPublishedBlogs } from '@/services/blogs.service'
import { BlogCategory, PublicBlogCard } from '@/types/publicBlog'

const INITIAL_VISIBLE_CARDS = 3

const sortByPublishedDate = (a: PublicBlogCard, b: PublicBlogCard) =>
  new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()

const orderBlogs = (blogs: PublicBlogCard[]) => {
  const featuredBlogs = blogs.filter((blog) => blog.isFeatured).sort(sortByPublishedDate)
  const regularBlogs = blogs.filter((blog) => !blog.isFeatured).sort(sortByPublishedDate)

  return [...featuredBlogs, ...regularBlogs]
}

export const useBlogFeed = () => {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | null>(null)
  const [visibleCards, setVisibleCards] = useState(INITIAL_VISIBLE_CARDS)
  const publicBlogs = orderBlogs(getPublishedBlogs())

  const filteredBlogs = publicBlogs.filter((blog) =>
    activeCategory ? blog.category === activeCategory : true
  )

  const featuredBlog = filteredBlogs[0] ?? null
  const secondaryBlogs = filteredBlogs.slice(1, visibleCards + 1)
  const canLoadMore = filteredBlogs.length > secondaryBlogs.length + 1

  useEffect(() => {
    setVisibleCards(INITIAL_VISIBLE_CARDS)
  }, [activeCategory])

  const toggleCategory = (category: BlogCategory) => {
    setActiveCategory((currentCategory) => (currentCategory === category ? null : category))
  }

  return {
    activeCategory,
    categories: BLOG_FILTERS,
    featuredBlog,
    secondaryBlogs,
    canLoadMore,
    hasResults: filteredBlogs.length > 0,
    toggleCategory,
    loadMore: () => setVisibleCards((currentVisibleCards) => currentVisibleCards + 3)
  }
}
