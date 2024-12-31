export default function StructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Is it on aitronz Database?',
    applicationCategory: 'GameSearchEngine',
    operatingSystem: 'Any',
    description: 'Fast and reliable game search engine with advanced filtering capabilities',
    url: 'https://isitonaitronzdatabase.vercel.app',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
} 