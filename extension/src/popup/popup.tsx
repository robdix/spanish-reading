import { useState, useEffect } from 'react'
import type { Difficulty } from '@/types'

interface ExtractedContent {
  headline: string
  content: string
}

export function Popup() {
  const [level, setLevel] = useState<Difficulty>('B1')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState<ExtractedContent | null>(null)

  // Extract content when popup opens
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
      if (!tab.id) return
      
      try {
        const [{ result }] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // Content script function here
            const selectors = {
              headline: ['h1', '[data-testid="headline"]', '.article-headline'],
              content: ['article', '[data-testid="article-body"]', '.article-content']
            }

            const headline = selectors.headline
              .map(s => document.querySelector(s))
              .find(el => el)?.textContent?.trim() || ''

            const content = selectors.content
              .map(s => document.querySelector(s))
              .find(el => el)?.textContent?.trim() || ''

            return { headline, content }
          }
        })
        setContent(result)
      } catch (error) {
        setError('Failed to extract content')
        console.error(error)
      }
    })
  }, [])

  const handleTranslate = () => {
    if (!content) return

    const params = new URLSearchParams({
      text: `${content.headline}\n\n${content.content}`,
      level,
      source: 'extension'
    })

    window.open(`${process.env.NEXT_PUBLIC_APP_URL}/translate?${params}`, '_blank')
  }

  return (
    <div className="w-96 p-4">
      <select 
        value={level}
        onChange={(e) => setLevel(e.target.value as Difficulty)}
        className="w-full mb-4"
      >
        <option value="A1">Beginner (A1)</option>
        <option value="A2">Elementary (A2)</option>
        <option value="B1">Intermediate (B1)</option>
        <option value="B2">Upper Intermediate (B2)</option>
        <option value="C1">Advanced (C1)</option>
      </select>

      {content && (
        <div className="mb-4 max-h-60 overflow-y-auto">
          <h3 className="font-bold mb-2">{content.headline}</h3>
          <p className="text-sm text-gray-600">
            {content.content.slice(0, 200)}...
          </p>
        </div>
      )}

      <button
        onClick={handleTranslate}
        disabled={isLoading || !content}
        className="w-full btn-primary"
      >
        {isLoading ? 'Loading...' : 'Translate Article'}
      </button>

      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  )
} 