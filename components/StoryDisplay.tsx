'use client'

import { StoryText } from './StoryText'

function countWords(text: string | null): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

interface StoryDisplayProps {
  content: string | null
  error: string | null
  isLoading?: boolean
  isMarkingAsRead?: boolean
  onWordSelect: (word: string, context: string) => void
  selectedWord?: string | null
  onMarkAsRead?: () => void
  isRead?: boolean
}

export function StoryDisplay({ content, error, isLoading, isMarkingAsRead, onWordSelect, selectedWord, isRead, onMarkAsRead }: StoryDisplayProps) {
  if (isLoading) {
    return (
      <div className="prose-container animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-8"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="prose-container">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    )
  }

  if (!content) return null;

  return (
    <div className="prose-container">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 mb-8">
        <StoryText
          content={content}
          onWordSelect={(word) => {
            // Get surrounding context (e.g., 100 characters before and after)
            const wordPos = content.toLowerCase().indexOf(word.toLowerCase())
            const beforeContext = content.slice(Math.max(0, wordPos - 100), wordPos).trim()
            const afterContext = content.slice(wordPos + word.length, wordPos + word.length + 100).trim()
            const context = `...${beforeContext} ${word} ${afterContext}...`
            onWordSelect(word, context)
          }}
          selectedWord={selectedWord}
        />

        <div className="mt-8 pt-6 border-t flex justify-between items-center">
          <span className="text-sm text-gray-500 font-sans">
            {countWords(content)} words
          </span>
          {!isRead && onMarkAsRead && (
            <button
              onClick={onMarkAsRead}
              disabled={isMarkingAsRead}
              className="btn-primary"
            >
              {isMarkingAsRead ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Mark as Read'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 