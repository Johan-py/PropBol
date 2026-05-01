export const CATEGORY_COLORS = [
  {
    bg: 'bg-blue-500',
    text: 'text-white',
    border: 'border-blue-500',
    hoverText: 'hover:text-blue-600',
    hoverBorder: 'hover:border-blue-500',
    lightBg: 'bg-blue-500/5',
    lightBorder: 'border-blue-500/20',
    lightText: 'text-blue-600'
  },
  {
    bg: 'bg-emerald-500',
    text: 'text-white',
    border: 'border-emerald-500',
    hoverText: 'hover:text-emerald-600',
    hoverBorder: 'hover:border-emerald-500',
    lightBg: 'bg-emerald-500/5',
    lightBorder: 'border-emerald-500/20',
    lightText: 'text-emerald-600'
  },
  {
    bg: 'bg-purple-500',
    text: 'text-white',
    border: 'border-purple-500',
    hoverText: 'hover:text-purple-600',
    hoverBorder: 'hover:border-purple-500',
    lightBg: 'bg-purple-500/5',
    lightBorder: 'border-purple-500/20',
    lightText: 'text-purple-600'
  },
  {
    bg: 'bg-amber-500',
    text: 'text-white',
    border: 'border-amber-500',
    hoverText: 'hover:text-amber-600',
    hoverBorder: 'hover:border-amber-500',
    lightBg: 'bg-amber-500/5',
    lightBorder: 'border-amber-500/20',
    lightText: 'text-amber-600'
  },
  {
    bg: 'bg-rose-500',
    text: 'text-white',
    border: 'border-rose-500',
    hoverText: 'hover:text-rose-600',
    hoverBorder: 'hover:border-rose-500',
    lightBg: 'bg-rose-500/5',
    lightBorder: 'border-rose-500/20',
    lightText: 'text-rose-600'
  },
  {
    bg: 'bg-cyan-500',
    text: 'text-white',
    border: 'border-cyan-500',
    hoverText: 'hover:text-cyan-600',
    hoverBorder: 'hover:border-cyan-500',
    lightBg: 'bg-cyan-500/5',
    lightBorder: 'border-cyan-500/20',
    lightText: 'text-cyan-600'
  },
  {
    bg: 'bg-fuchsia-500',
    text: 'text-white',
    border: 'border-fuchsia-500',
    hoverText: 'hover:text-fuchsia-600',
    hoverBorder: 'hover:border-fuchsia-500',
    lightBg: 'bg-fuchsia-500/5',
    lightBorder: 'border-fuchsia-500/20',
    lightText: 'text-fuchsia-600'
  }
]

export function getCategoryColor(category: string) {
  if (!category) return CATEGORY_COLORS[0]
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length]
}
