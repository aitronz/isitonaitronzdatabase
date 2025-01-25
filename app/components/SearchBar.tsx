'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  onSearch: (query: string) => void
  className?: string
}

export default function SearchBar({ onSearch, className }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const searchParams = useSearchParams()
  const { t } = useLanguage()

  useEffect(() => {
    const searchQuery = searchParams.get('q')
    if (searchQuery) {
      setQuery(searchQuery)
    }
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={cn(
        "search-input-container",
        "relative group",
        "bg-zinc-900/50 backdrop-blur-sm",
        "border border-zinc-800/50",
        "transition-all duration-300",
        isFocused && "animate-border-glow"
      )}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 
            group-hover:text-purple-400 transition-colors duration-300" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t('search.placeholder')}
            className={cn(
              "w-full bg-transparent",
              "pl-12 pr-4 py-4",
              "text-white placeholder-zinc-400",
              "text-lg",
              "focus:outline-none focus:ring-0",
              "transition-all duration-300",
              "placeholder:transition-opacity placeholder:duration-300",
              "group-hover:placeholder-zinc-300",
              className
            )}
          />
        </div>
      </div>
    </form>
  )
} 