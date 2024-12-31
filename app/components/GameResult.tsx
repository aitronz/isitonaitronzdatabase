'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '../lib/utils'
import UrlSelectionPopup from './UrlSelectionPopup'
import { useLanguage } from '../context/LanguageContext'
import { Download, Copy, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { jsonSources } from '../config/sources'
import Image from 'next/image'

interface Source {
  sourceName: string
  uploadDate: string
  downloadUrls?: Array<{
    name: string; 
    url: string; 
    uploadDate: string; 
    fileSize: string
  }>
}

interface GameResultProps {
  name: string
  image?: string
  sources: Source[]
  genres?: string[]
}

export default function GameResult({ name, image, sources, genres = [] }: GameResultProps) {
  console.log('GameResult Debug:', {
    componentName: 'GameResult',
    props: {
      name,
      genres: {
        value: genres,
        type: typeof genres,
        isArray: Array.isArray(genres),
        length: genres?.length,
        entries: Array.isArray(genres) ? [...genres] : 'not an array'
      }
    }
  });

  const genresList = Array.isArray(genres) ? genres : [];
  
  console.log('GameResult rendering:', {
    name,
    genresProvided: genresList,
    genresLength: genresList.length
  });
  
  const [showUrlPopup, setShowUrlPopup] = useState(false)
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)
  const { t, language } = useLanguage()
  const [imageError, setImageError] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)

  // Try different image formats in sequence
  const tryNextImageFormat = (currentUrl: string) => {
    // Extract the original Steam URL from our proxy URL
    const params = new URLSearchParams(currentUrl.split('?')[1]);
    const originalUrl = params.get('url') || '';
    
    if (originalUrl.includes('header.jpg')) {
      const newUrl = originalUrl.replace('header.jpg', 'capsule_616x353.jpg');
      return `/api/image-proxy?url=${encodeURIComponent(newUrl)}`;
    }
    if (originalUrl.includes('capsule_616x353.jpg')) {
      const newUrl = originalUrl.replace('capsule_616x353.jpg', 'capsule_231x87.jpg');
      return `/api/image-proxy?url=${encodeURIComponent(newUrl)}`;
    }
    if (originalUrl.includes('capsule_231x87.jpg')) {
      const newUrl = originalUrl.replace('capsule_231x87.jpg', 'capsule_184x69.jpg');
      return `/api/image-proxy?url=${encodeURIComponent(newUrl)}`;
    }
    return null;
  };

  useEffect(() => {
    if (!image) return;
    setImageUrl(image);
    setImageError(false);
  }, [image]);

  const isValidImageUrl = image && image.includes('/apps/') && image.endsWith('/header.jpg');

  const getSourceUrl = (sourceName: string) => {
    const sourceConfig = jsonSources.find(s => s.name === sourceName);
    return sourceConfig?.url || '';
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-xl bg-zinc-900/50 border border-zinc-800/50 transition-all duration-300 hover:border-zinc-700/50 hover:shadow-xl hover:shadow-purple-500/5">
        {imageUrl && !imageError && (
          <div className="absolute inset-0">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover opacity-40 transition-opacity duration-300 group-hover:opacity-50"
              onError={() => {
                const nextUrl = tryNextImageFormat(imageUrl);
                if (nextUrl) {
                  console.log('Trying next image format:', nextUrl);
                  setImageUrl(nextUrl);
                } else {
                  console.error('All image formats failed for:', name);
                  setImageError(true);
                }
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/80 to-black/70" />
          </div>
        )}

        <div className="relative z-10 flex flex-col h-full backdrop-blur-sm">
          <h2 className="px-5 py-4 text-xl font-bold text-white/90 sm:text-2xl border-b border-zinc-800/50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="truncate">{name}</span>
              {genresList.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {genresList.map((genre, index) => (
                    <span 
                      key={index}
                      className="text-xs font-normal text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded-full"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className="text-xs font-normal text-zinc-500">
              {sources.length} {sources.length === 1 ? 'source' : 'sources'}
            </span>
          </h2>

          <div className="divide-y divide-zinc-800/30">
            {sources.map((source, index) => {
              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3 transition-all duration-200 group/item",
                    "hover:bg-gradient-to-r hover:from-white/[0.03] hover:to-transparent"
                  )}
                >
                  <div className="flex-1 min-w-0 flex items-center gap-6">
                    <span className="text-white/90 font-medium truncate min-w-[160px] text-sm">
                      {source.sourceName}
                    </span>

                    <div className="hidden sm:flex items-center gap-1.5 text-zinc-500 text-xs">
                    <Download className="w-3.5 h-3.5" />
                      <span className="tabular-nums">
                      {source.downloadUrls?.length}
                      </span>
                    </div>
                  </div>
                    <button
                      onClick={() => {
                        setSelectedSource(source);
                        setShowUrlPopup(true);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded",
                        "bg-zinc-800/50 text-zinc-400 opacity-0 group-hover/item:opacity-100",
                        "hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 text-xs font-medium"
                      )}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{t('gameResult.select')}</span>
                    </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <UrlSelectionPopup
        isOpen={showUrlPopup}
        onClose={() => setShowUrlPopup(false)}
        options={selectedSource?.downloadUrls || []}
        onSelect={(url) => {
          navigator.clipboard.writeText(url);
          if (selectedSource) {
            setTimeout(() => {
              setShowUrlPopup(false);
            }, 2000);
          }
        }}
      />
    </>
  );
} 