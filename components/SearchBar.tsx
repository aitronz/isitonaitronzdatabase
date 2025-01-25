'use client'

import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/app/context/LanguageContext'
import { useState } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  isMobileSearch?: boolean
  className?: string
}

export default function SearchBar({ onSearch, isMobileSearch, className }: SearchBarProps) {
  const { t } = useLanguage()
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get('query')?.toString() || ''
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className={cn(
        "search-input-container",
        "relative group",
        "bg-zinc-900/30 backdrop-blur-sm",
        "border border-zinc-800/30",
        "transition-all duration-300",
        !isFocused && "animate-border-pulse",
        isFocused && "animate-border-glow border-purple-500/50",
        "rounded-xl"
      )}>
        <div className="relative">
          <Search className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5",
            "transition-colors duration-300",
            isFocused ? "text-purple-400" : "text-zinc-400 group-hover:text-purple-400"
          )} />
          <input
            type="text"
            name="query"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t('searchPlaceholder')}
            className={cn(
              "w-full bg-transparent",
              "pl-12 pr-4 py-4",
              "text-white placeholder-zinc-400",
              "text-lg",
              "border-none focus:outline-none focus:ring-0",
              "transition-all duration-300",
              "placeholder:transition-opacity placeholder:duration-300",
              "group-hover:placeholder-zinc-300",
              // WebKit autofill override
              "[&:-webkit-autofill]:bg-zinc-900/50",
              "[&:-webkit-autofill]:text-white",
              "[&:-webkit-autofill]:shadow-[0_0_0_30px_rgb(24_24_27_/_0.5)_inset]",
              "[&:-webkit-autofill]:[-webkit-text-fill-color:white]",
              className
            )}
            autoComplete="off"
          />
        </div>
      </div>
    </form>
  )
}

