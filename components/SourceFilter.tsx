'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, Filter } from 'lucide-react'
import { jsonSources } from '@/app/config/sources'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/app/context/LanguageContext'

interface SourceFilterProps {
  selectedSources: string[]
  onChange: (sources: string[]) => void
  isMainPage?: boolean
}

export default function SourceFilter({ selectedSources, onChange, isMainPage }: SourceFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { t } = useLanguage()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleSource = (sourceName: string) => {
    const newSources = selectedSources.includes(sourceName)
      ? selectedSources.filter(s => s !== sourceName)
      : [...selectedSources, sourceName]
    onChange(newSources)
  }

  const selectAll = () => {
    onChange(jsonSources.map(s => s.name))
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
          isMainPage 
            ? 'bg-zinc-900/50 backdrop-blur-sm text-zinc-400 hover:text-white'
            : 'bg-zinc-900/50 text-zinc-400 hover:text-white border border-zinc-800/50 hover:bg-zinc-800/50',
          selectedSources.length > 0 && 'text-purple-400 border-purple-500/20'
        )}
      >
        <Filter className="w-4 h-4" />
        {!isMainPage && t('sources')}
        <span className="text-xs">
          {selectedSources.length > 0 && `(${selectedSources.length})`}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute mt-2 rounded-xl bg-zinc-900/95 backdrop-blur-sm border border-zinc-800/50 shadow-xl",
          isMainPage ? "right-0" : "right-0",
          "w-64",
          "max-h-[80vh] overflow-y-auto"
        )}>
          <div className="p-2">
            <div className="flex gap-2 mb-2">
              <button
                onClick={selectAll}
                className="flex-1 px-3 py-1.5 text-xs rounded bg-zinc-800/50 text-zinc-400 hover:text-white transition-colors"
              >
                {t('filter.selectAll')}
              </button>
              <button
                onClick={clearAll}
                className="flex-1 px-3 py-1.5 text-xs rounded bg-zinc-800/50 text-zinc-400 hover:text-white transition-colors"
              >
                {t('filter.clearAll')}
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {jsonSources.map((source) => (
                <button
                  key={source.name}
                  onClick={() => toggleSource(source.name)}
                  className="flex items-center gap-2 w-full p-2 hover:bg-zinc-800/50 rounded text-sm text-left transition-colors"
                >
                  <div className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center',
                    selectedSources.includes(source.name)
                      ? 'bg-purple-500 border-purple-500'
                      : 'border-zinc-700'
                  )}>
                    {selectedSources.includes(source.name) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={cn(
                    'text-zinc-400',
                    selectedSources.includes(source.name) && 'text-white'
                  )}>
                    {source.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 