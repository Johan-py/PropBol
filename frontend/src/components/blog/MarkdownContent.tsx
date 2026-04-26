"use client"

import ReactMarkdown from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"

type MarkdownContentProps = {
  content: string
  className?: string
}

export default function MarkdownContent({
  content,
  className,
}: MarkdownContentProps) {
  return (
    <div
      className={
        className ??
        "prose prose-stone max-w-none prose-headings:font-heading prose-headings:text-stone-900 prose-p:text-stone-700 prose-p:leading-8 prose-strong:text-stone-900 prose-a:text-amber-700 prose-a:no-underline hover:prose-a:text-amber-800 prose-blockquote:border-amber-500 prose-blockquote:text-stone-600 prose-code:text-stone-800 prose-pre:bg-stone-900 prose-pre:text-stone-100"
      }
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="font-heading text-3xl font-bold" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="font-heading text-2xl font-bold" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="font-heading text-xl font-bold" {...props} />
          ),
          a: ({ ...props }) => (
            <a target="_blank" rel="noopener noreferrer" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
