import { jsonSources } from '../config/sources'

export interface GameData {
  name: string
  image?: string
  sources: ProcessedDownload[]
  genres: string[]
}

interface ProcessedDownload {
  sourceName: string;
  sourceUrl?: string;
  uploadDate: string;
  fileSize?: string;
  downloadUrls?: { name: string; url: string; uploadDate: string; fileSize: string}[];
}

interface Download {
  title: string
  uris: string[]
  uploadDate: string
  fileSize: string
}

interface SourceData {
  name: string
  downloads: Download[]
}

interface HydraApiGame {
  title: string
  genres: string[]
  objectId: string
}

// Cache for API results to prevent repeated requests
const apiCache = new Map<string, {
  data: HydraApiGame[];
  timestamp: number;
}>();

const API_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const MIN_QUERY_LENGTH = 3;
const MAX_RESULTS = 5;

// New function to fetch games from Hydra API
async function fetchGamesFromApi(query: string): Promise<HydraApiGame[]> {
  // Check cache first
  const cacheKey = query.toLowerCase();
  const cached = apiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < API_CACHE_DURATION) {
    return cached.data;
  }

  try {
    const requestBody = {
      title: query,
      take: MAX_RESULTS,
      skip: 0
    };
    console.log('Sending request to API:', requestBody);

    const response = await fetch('/api/hydra/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response in client:', data);

    // Check if data has the expected structure
    if (!data || !data.edges) {
      console.error('Unexpected API response format:', data);
      return [];
    }

    // Transform the edges into our HydraApiGame format
    const games: HydraApiGame[] = data.edges.map((edge: any) => {
      // Add more detailed logging
      const genres = edge.genres || [];
      console.log('Processing API edge:', {
        title: edge.title,
        rawGenres: edge.genres,
        processedGenres: genres,
        isArray: Array.isArray(genres)
      });

      return {
        title: edge.title,
        genres: genres,
        objectId: edge.objectId
      };
    });

    console.log('Transformed games:', games);

    // Update cache
    apiCache.set(cacheKey, {
      data: games,
      timestamp: Date.now()
    });

    return games;
  } catch (error) {
    console.error('Error fetching from Hydra API:', error);
    return [];
  }
}

// Source data cache remains the same
const sourceCache = new Map<string, {
  data: SourceData;
  timestamp: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000;

// Add a request cache to track in-flight requests
const inFlightRequests = new Map<string, Promise<SourceData | null>>();

// Modified to use game title from API more effectively
async function findMatchingDownloads(
  game: HydraApiGame,
  source: { name: string; url: string; additional_urls?: any[] }
): Promise<ProcessedDownload[]> {
  const data = await fetchSourceData(source);
  if (!data?.downloads) return [];

  // Clean the game title once
  const cleanGameName = game.title.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .trim();

  // Split into words and filter out short words and common words
  const gameWords = cleanGameName
    .split(' ')
    .filter(word => word.length > 2)
    .filter(word => !['the', 'and', 'for', 'of'].includes(word));

  // Find downloads that match this game
  const matches = data.downloads.filter(download => {
    const cleanTitle = download.title.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
    return gameWords.every(word => cleanTitle.includes(word));
  });

  // Sort by date and take the most recent
  const sortedMatches = matches.sort((a, b) => 
    new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
  );

  // Return only the most recent match and additional URLs
  if (sortedMatches.length > 0) {
    const match = sortedMatches[0];
    const downloadUrls = sortedMatches.map((download, index) => ({
      name: download.title,
      url: download.uris[0],
      uploadDate: download.uploadDate,
      fileSize: download.fileSize,
    }));
    return [{
      sourceName: source.name,
      uploadDate: match.uploadDate,
      fileSize: match.fileSize,
      downloadUrls: downloadUrls
    }];
  }

  return [];
}

async function fetchSourceData(source: { name: string; url: string }): Promise<SourceData | null> {
  // Check cache first
  const cached = sourceCache.get(source.name);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Check if there's already an in-flight request for this source
  const existingRequest = inFlightRequests.get(source.name);
  if (existingRequest) {
    return existingRequest;
  }

  // Create new request
  const request = new Promise<SourceData | null>(async (resolve) => {
    try {
      const response = await fetch(`/api/sources?source=${encodeURIComponent(source.name)}`, {
        cache: 'no-store'
      });

      if (!response.ok) {
        resolve(null);
        return;
      }

      const data: SourceData = await response.json();
      
      // Update cache
      sourceCache.set(source.name, {
        data,
        timestamp: Date.now()
      });

      resolve(data);
    } catch (error) {
      console.error(`Error fetching from ${source.name}:`, error);
      resolve(null);
    }
  });

  // Store the request promise
  inFlightRequests.set(source.name, request);

  // Clean up after request completes
  request.finally(() => {
    inFlightRequests.delete(source.name);
  });

  return request;
}

// Main search function updated
export async function searchGames(query: string, selectedSources: string[] = []): Promise<GameData[]> {
  if (!query || query.length < MIN_QUERY_LENGTH) {
    return [];
  }

  console.log('Searching for:', query);

  // 1. Fetch games from Hydra API
  const hydraGames = await fetchGamesFromApi(query);
  
  // Safe logging with null check
  console.log('Found games from API:', hydraGames?.map(g => g.title) || []);

  if (!hydraGames || hydraGames.length === 0) {
    console.log('No games found from API');
    return [];
  }

  // 2. For each game, search through selected sources
  const results = new Map<string, GameData>();
  const sourcesToSearch = selectedSources.length > 0 
    ? jsonSources.filter(source => selectedSources.includes(source.name))
    : jsonSources;

  for (const hydraGame of hydraGames) {
    console.log('Processing game:', hydraGame.title);
    const sources: ProcessedDownload[] = [];

    // Search through selected sources
    for (const source of sourcesToSearch) {
      try {
        console.log('Checking source:', source.name);
        const downloads = await findMatchingDownloads(hydraGame, source);
        if (downloads.length > 0) {
          console.log('Found matches in source:', source.name);
          sources.push(...downloads);
        }
      } catch (error) {
        console.error(`Error processing source ${source.name}:`, error);
      }
    }

    // Only add games that have sources
    if (sources.length > 0) {
      // Create a deep copy of genres
      const gameGenres = JSON.parse(JSON.stringify(hydraGame.genres || []));
      
      console.log('Creating GameData:', {
        title: hydraGame.title,
        originalGenres: hydraGame.genres,
        copiedGenres: gameGenres
      });

      const gameData: GameData = {
        name: hydraGame.title,
        genres: gameGenres,
        image: (() => {
          const steamUrl = `https://cdn.cloudflare.steamstatic.com/steam/apps/${hydraGame.objectId}/header.jpg`;
          // Use our proxy instead
          const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(steamUrl)}`;
          console.log('Constructed proxy image URL:', {
            objectId: hydraGame.objectId,
            originalUrl: steamUrl,
            proxyUrl
          });
          return proxyUrl;
        })(),
        sources: sources
      };

      // Verify the data
      console.log('GameData created:', {
        name: gameData.name,
        genres: gameData.genres,
        hasGenres: Array.isArray(gameData.genres),
        genresLength: gameData.genres.length
      });

      results.set(hydraGame.title, gameData);
    }
  }

  const finalResults = Array.from(results.values())
    .sort((a, b) => {
      const latestA = Math.max(...a.sources.map(s => new Date(s.uploadDate).getTime()));
      const latestB = Math.max(...b.sources.map(s => new Date(s.uploadDate).getTime()));
      return latestB - latestA;
    });

  // Add this detailed log
  console.log('Final results before return:', finalResults.map(r => ({
    name: r.name,
    hasGenres: Boolean(r.genres),
    genresLength: r.genres?.length,
    actualGenres: r.genres
  })));

  return finalResults;
}

export function parseFileSize(size: string): number {
  const match = size.match(/^([\d.]+)\s*(MB|GB)$/i);
  if (!match) return 0;
  
  const [, value, unit] = match;
  const numValue = parseFloat(value);
  
  // Convert everything to MB for comparison
  if (unit.toUpperCase() === 'GB') {
    return numValue * 1024; // Convert GB to MB
  }
  return numValue; // Already in MB
}

