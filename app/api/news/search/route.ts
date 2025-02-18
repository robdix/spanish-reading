import { NextResponse } from 'next/server'
import { RSSFeed, type NewsSource } from '@/utils/rss'

// These could live in a config file
export const NEWS_CATEGORIES = {
  WORLD: 'world',
  TECHNOLOGY: 'technology',
  BUSINESS: 'business',
  SCIENCE: 'science',
  SPORTS: 'sports',
  ENTERTAINMENT: 'entertainment',
  HEALTH: 'health',
  POLITICS: 'politics'
} as const

export type NewsCategory = keyof typeof NEWS_CATEGORIES

export const REGIONS = {
  GLOBAL: '',
  LATIN_AMERICA: 'latin_america',
  SPAIN: 'spain',
  USA: 'us',
  EUROPE: 'europe'
} as const

export type Region = keyof typeof REGIONS

interface RequestBody {
  source: NewsSource
}

export async function POST(request: Request) {
  if (typeof window !== 'undefined') {
    return NextResponse.json(
      { error: 'This endpoint can only be called from the server' },
      { status: 400 }
    )
  }

  try {
    const { source } = await request.json() as RequestBody
    const stories = await RSSFeed.getNews(source)
    return NextResponse.json({ stories })
  } catch (error) {
    console.error('News search error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
} 