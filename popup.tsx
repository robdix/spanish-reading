import { useState } from 'react'
import type { Difficulty } from '@/types'

export function Popup() {
  const [level, setLevel] = useState<Difficulty>('B1')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTranslate = async () => {
    try {
      setIsLoading(true)
      
      // Get current tab content
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      const { headline, content } = await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        func: extractPageContent
      })

      // Open app in new tab with content
      const params = new URLSearchParams({
        text: `${headline}\n\n${content}`,
        level,
        source: 'extension'
      })

      window.open(`${process.env.NEXT_PUBLIC_APP_URL}/translate?${params}`, '_blank')
    } catch (error) {
      setError('Failed to extract content')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-64 p-4">
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

      <button
        onClick={handleTranslate}
        disabled={isLoading}
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