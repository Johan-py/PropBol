'use client'

import { BlogCategory } from '@/types/publicBlog'

type BlogFilterChipsProps = {
  categories: readonly BlogCategory[]
  activeCategory: BlogCategory | null
  onToggleCategory: (category: BlogCategory) => void
}

const baseChipClassName =
  'rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] transition-colors duration-200 whitespace-nowrap'

export default function BlogFilterChips({
  categories,
  activeCategory,
  onToggleCategory
}: BlogFilterChipsProps) {
  return (
    <div className="flex min-w-max gap-3 sm:min-w-0 sm:flex-wrap">
      {categories.map((category) => {
        const isActive = activeCategory === category

        return (
          <button
            key={category}
            type="button"
            onClick={() => onToggleCategory(category)}
            aria-pressed={isActive}
            className={`${baseChipClassName} ${
              isActive
                ? 'border-stone-900 bg-stone-900 text-white'
                : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500 hover:text-stone-900'
            }`}
          >
            {category}
          </button>
        )
      })}
    </div>
  )
}
