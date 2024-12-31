import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import StructuredData from './components/StructuredData'
import { LanguageProvider } from './context/LanguageContext'
import AnimatedBackground from './components/AnimatedBackground'
import { Suspense } from 'react'
import Navbar from './components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Is it on aitronz Database?',
  description: 'Fast and reliable game search engine. Find games across multiple sources, with advanced filtering and sorting capabilities. Always up-to-date with the latest releases.',
  keywords: 'game search, hydra launcher, game downloads, game finder, hydralinks, hydra, hydra sources, hydra fonte, hydra launcher sources, hydra launcher fonte, Esta no Hydra, Is it on aitronz Database?, isitonhydra?, aitronz, Hydra Launcher Discord',
  openGraph: {
    title: 'Is it on aitronz Database?',
    description: 'Fast and reliable game search engine with advanced filtering capabilities',
    url: 'https://isitonaitronzdatabase.vercel.app',
    siteName: 'Is it on aitronz Database?',
    images: [
      {
        url: '/preview.png',
        width: 1200,
        height: 630,
        alt: 'Is it on Hydra Preview'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Is it on aitronz Database? - Game Search Engine',
    description: 'Fast and reliable game search engine with advanced filtering capabilities',
    images: ['/preview.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification code
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://isitonaitronzdatabase.vercel.app" />
        <StructuredData />
      </head>
      <body className={inter.className}>
        <Suspense fallback={null}>
          <AnimatedBackground />
        </Suspense>
        <LanguageProvider>
          <Navbar />
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}

