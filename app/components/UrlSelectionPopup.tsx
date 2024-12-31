'use client'

import { useLanguage } from '../context/LanguageContext'
import { formatDate } from '../lib/utils'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface UrlSelectionPopupProps {
  isOpen: boolean
  onClose: () => void
  options: Array<{
    name: string; 
    url: string; 
    uploadDate: string; 
    fileSize: string
  }>
  onSelect: (url: string) => void
}

export default function UrlSelectionPopup({ isOpen, onClose, options, onSelect }: UrlSelectionPopupProps) {
  const { t, language } = useLanguage()
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const [showCopied, setShowCopied] = useState(false)

  // Reset states when popup closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedUrl(null)
      setShowCopied(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleRightClick = (url: string) => {
    window.open(url, '_blank');
  }
  
  const handleLeftClick = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setSelectedUrl(url)
      setShowCopied(true)
      onSelect(url)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" 
        onClick={onClose}
      />

      {/* Popup Container */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50">
        <div 
          className="bg-zinc-900/95 border border-zinc-800/50 rounded-xl shadow-xl p-6 m-4" 
          onClick={e => e.stopPropagation()}
        >
          {/* Popup Title */}
          <h3 className="text-lg font-medium text-white mb-4">
            {t('gameResult.selectVersion')}
          </h3>

          {/* Version Options */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.url}
                onClick={() => handleLeftClick(option.url)}
                onContextMenu={() => handleRightClick(option.url)}
                className={cn(
                  "w-full px-4 py-3 rounded text-left transition-all duration-200",
                  "flex items-center justify-between",
                  selectedUrl === option.url
                    ? "bg-purple-500/20 text-purple-300"
                    : "text-zinc-300 hover:bg-zinc-800/50"
                )}
              >
                <div className="flex-1">
                  <div className="font-medium">{option.name}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{option.fileSize}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{formatDate(option.uploadDate, language)}</div>
                </div>
                {selectedUrl === option.url && showCopied && (
                  <span className="text-xs text-green-500 ml-3">
                    {t('gameResult.copied')}! ✓
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Footer with Close button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
} 