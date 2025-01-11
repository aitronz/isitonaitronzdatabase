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
    <main className="flex min-h-screen flex-col items-center p-4 relative">
      {/* Language Switcher - Adjusted for mobile */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex justify-end">
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-lg p-1">
          </div>
        </div>
      </div>

      {/* Main Content - Removed justify-center to prevent overlap */}
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-white text-center">
          {t('title')}
        </h1>
        <p className="text-zinc-400 text-center">
          {t('subtitle')}
        </p>

        {/* Search and Filter Container */}
        <div className="flex gap-2">
          {/* Search Bar */}
          <div className="flex-1 bg-zinc-900/50 backdrop-blur-sm rounded-xl p-2">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Source Filter */}
          <div className="flex-shrink-0">
            <SourceFilter
              selectedSources={selectedSources}
              onChange={setSelectedSources}
              isMainPage={true}
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
          <div className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-xl">
            <div className="text-purple-400 mb-2">⚡</div>
            <h3 className="text-white font-medium mb-1">
              {t('features.fast.title')}
            </h3>
            <p className="text-sm text-zinc-400">
              {t('features.fast.description')}
            </p>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-xl">
            <div className="text-purple-400 mb-2">🔍</div>
            <h3 className="text-white font-medium mb-1">
              {t('features.smart.title')}
            </h3>
            <p className="text-sm text-zinc-400">
              {t('features.smart.description')}
            </p>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-xl">
            <div className="text-purple-400 mb-2">🛡️</div>
            <h3 className="text-white font-medium mb-1">
              {t('features.reliable.title')}
            </h3>
            <p className="text-sm text-zinc-400">
              {t('features.reliable.description')}
            </p>
          </div>
        </div>

        {/* Credits Section */}
        <div className="pt-8 border-t border-zinc-800/50">
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm font-medium text-zinc-400">
              {t('credits')}
            </p>
            <div className="flex items-center gap-4">
            </div>
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

