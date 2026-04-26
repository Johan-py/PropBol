"use client";

import { useEffect, useState } from "react";
import { getPublishedBlogs, getBlogCategories } from "@/services/blogs.service";
import { BlogCategory, PublicBlogCard } from "@/types/publicBlog";

const INITIAL_VISIBLE_CARDS = 3;

const sortByPublishedDate = (a: PublicBlogCard, b: PublicBlogCard) =>
  new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

const orderBlogs = (blogs: PublicBlogCard[]) => {
  const featuredBlogs = blogs
    .filter((blog) => blog.isFeatured)
    .sort(sortByPublishedDate);
  const regularBlogs = blogs
    .filter((blog) => !blog.isFeatured)
    .sort(sortByPublishedDate);

  return [...featuredBlogs, ...regularBlogs];
};

export const useBlogFeed = () => {
  const [blogs, setBlogs] = useState<PublicBlogCard[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<BlogCategory | null>(
    null,
  );
  const [visibleCards, setVisibleCards] = useState(INITIAL_VISIBLE_CARDS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [blogsData, categoriesData] = await Promise.all([
          getPublishedBlogs(50),
          getBlogCategories(),
        ]);
        setBlogs(orderBlogs(blogsData));
        setCategories(categoriesData.map((c) => c.nombre));
      } catch (error) {
        console.error("Error fetching data for blog feed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // RESTAURAR CATEGORÍA
  useEffect(() => {
    const savedCategory = localStorage.getItem("blogCategory");
    if (savedCategory) {
      setActiveCategory(savedCategory as BlogCategory);
    }
  }, []);

  // ✅ GUARDAR CATEGORÍA
  useEffect(() => {
    if (activeCategory) {
      localStorage.setItem("blogCategory", activeCategory);
    } else {
      localStorage.removeItem("blogCategory");
    }
  }, [activeCategory]);

  // ✅ RESTAURAR SCROLL
  useEffect(() => {
    const savedScroll = localStorage.getItem("blogScroll");
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo(0, Number(savedScroll));
      }, 100);
    }
  }, []);

  // 🔥 FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [blogsData, categoriesData] = await Promise.all([
          getPublishedBlogs(50),
          getBlogCategories(),
        ]);
        setBlogs(orderBlogs(blogsData));
        setCategories(categoriesData.map((c) => c.nombre));
      } catch (error) {
        console.error("Error fetching data for blog feed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredBlogs = blogs.filter((blog) =>
    activeCategory ? blog.category === activeCategory : true,
  );

  const featuredBlog = filteredBlogs[0] ?? null;
  const secondaryBlogs = filteredBlogs.slice(1, visibleCards + 1);
  const canLoadMore = filteredBlogs.length > secondaryBlogs.length + 1;

  useEffect(() => {
    setVisibleCards(INITIAL_VISIBLE_CARDS);
  }, [activeCategory]);

  const toggleCategory = (category: BlogCategory | null) => {
    if (category === null) {
      setActiveCategory(null);
      return;
    }
    setActiveCategory((currentCategory) =>
      currentCategory === category ? null : category,
    );
  };

  return {
    activeCategory,
    categories,
    featuredBlog,
    secondaryBlogs,
    canLoadMore,
    hasResults: filteredBlogs.length > 0,
    isLoading,
    toggleCategory,
    loadMore: () =>
      setVisibleCards((currentVisibleCards) => currentVisibleCards + 3),
  };
};
