'use client'

import SearchBar from '@/components/SearchBar'
import SourceFilter from '@/components/SourceFilter'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { Github, MessageSquare, Globe } from 'lucide-react'
import { useLanguage } from './context/LanguageContext'
import GameResult from './components/GameResult'
import { searchGames, GameData } from './lib/searchGames'
import LanguageSwitcher from './components/LanguageSwitcher'
import { cn } from '@/lib/utils'

export default function Home() {
  const router = useRouter()
  const [selectedSources, setSelectedSources] = useLocalStorage<string[]>('selectedSources', [])
  const { t } = useLanguage()
  const [results, setResults] = useState<GameData[]>([])

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      const searchResults = await searchGames(query, selectedSources)
      setResults(searchResults)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      {/* Language Switcher - New Design */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      {/* Main Content - Centered */}
      <div className="w-full max-w-2xl space-y-12 -mt-16">
        {/* Title Section - Updated with effects */}
        <div className="space-y-6 text-center">
          <h1 className={cn(
            "text-5xl sm:text-6xl font-bold",
            "tracking-tight",
            "gradient-text animate-title-glow",
            "transition-all duration-300"
          )}>
            {t('title')}
          </h1>
          <p className={cn(
            "text-lg sm:text-xl",
            "text-zinc-400",
            "max-w-lg mx-auto",
            "leading-relaxed",
            "transition-all duration-300",
            "hover:text-zinc-300"
          )}>
            {t('subtitle')}
          </p>
        </div>

        {/* Search Section with Inline Filter */}
        <div className="flex gap-3">
          {/* Search Bar */}
          <div className="flex-1">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Source Filter - Inline */}
          <div className="flex-shrink-0">
            <SourceFilter
              selectedSources={selectedSources}
              onChange={setSelectedSources}
              isMainPage={true}
            />
          </div>
        </div>

        {/* Credits Section - Updated */}
        <div className="pt-8 border-t border-zinc-800/30">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-6">
              <a 
                href="https://discord.gg/hydralaunchercommunity" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-zinc-500 hover:text-purple-400 transition-all duration-300"
                aria-label="Join our Discord"
              >
                <MessageSquare className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com/zxcsix-zxc/isitonhydra" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-zinc-500 hover:text-purple-400 transition-all duration-300"
                aria-label="View source on GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://hydralinks.cloud" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-zinc-500 hover:text-purple-400 transition-all duration-300"
                aria-label="Visit Hydra Links"
              >
                <Globe className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors duration-300">
              {t('credits')}
            </p>
          </div>
        </div>

        {/* Game Results */}
        {results.map((game) => (
          <GameResult
            key={game.name}
            name={game.name}
            image={game.image}
            sources={game.sources}
            genres={game.genres}
          />
        ))}
      </div>
    </main>
  )
}

