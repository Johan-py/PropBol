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
  const [blogs, setBlogs] = useState<PublicBlogCard[]>([])
  const [activeCategory, setActiveCategory] = useState<BlogCategory | null>(null)
  const [visibleCards, setVisibleCards] = useState(INITIAL_VISIBLE_CARDS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true)
      try {
        const data = await getPublishedBlogs(50) // Ajustar limite según necesidad
        setBlogs(orderBlogs(data))
      } catch (error) {
        console.error('Error fetching blogs for feed:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBlogs()
  }, [])

  const filteredBlogs = blogs.filter((blog) =>
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
    isLoading,
    toggleCategory,
    loadMore: () => setVisibleCards((currentVisibleCards) => currentVisibleCards + 3)
  }
}
