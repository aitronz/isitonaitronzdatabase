'use client'

import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { US, BR, RU } from 'country-flag-icons/react/3x2'

const languages = {
  en: {
    name: 'English',
    flag: US,
    label: 'United States'
  },
  pt: {
    name: 'Português',
    flag: BR,
    label: 'Brasil'
  },
  ru: {
    name: 'Русский',
    flag: RU,
    label: 'Россия'
  }
} as const

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const { language, setLanguage } = useLanguage()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLang = languages[language as keyof typeof languages]
  const Flag = selectedLang.flag

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded",
          "bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm",
          "text-zinc-400 hover:text-white transition-all duration-200",
          "hover:bg-zinc-900/70 hover:border-zinc-700/50"
        )}
      >
        <Globe className="w-4 h-4" />
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 rounded-sm shadow-sm" />
          <span className="text-sm">{selectedLang.name}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute mt-2 right-0 w-44 overflow-hidden rounded bg-zinc-900/95 backdrop-blur-sm border border-zinc-800/50 shadow-xl animate-fade-in">
          {(Object.entries(languages)).map(([code, lang]) => {
            const LangFlag = lang.flag
            return (
              <button
                key={code}
                onClick={() => {
                  setLanguage(code as keyof typeof languages)
                  setIsOpen(false)
                }}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm transition-all duration-200",
                  "flex items-center",
                  code === language
                    ? "bg-purple-500/20 text-purple-300"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <LangFlag className="w-5 h-5 rounded-sm shadow-sm" />
                  <span className="truncate">{lang.name}</span>
                  <span className="text-xs text-zinc-500 truncate ml-1.5">
                    {lang.label}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
} 