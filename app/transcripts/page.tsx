'use client'

import { useState } from 'react'
import { StoryText } from '@/components/StoryText'
import { DefinitionSidebar } from '@/components/DefinitionSidebar'
import { supabase } from '@/utils/supabase'
import { markStoryAsRead } from '@/utils/reading'
import { StatsOverview } from '@/components/StatsOverview'

interface AnalysisItem {
  phrase: string
  type: 'word' | 'idiom' | 'collocation'
  translation: string
  context: string
  notes?: string
}

export default function TranscriptsPage() {
  const [text, setText] = useState('')
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [context, setContext] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false)
  const [analysisItems, setAnalysisItems] = useState<AnalysisItem[]>([])
  const [error, setError] = useState<string | null>(null)

  // Calculate word count
  const wordCount = text ? text.trim().split(/\s+/).length : 0

  const handleMarkAsRead = async () => {
    if (!text.trim()) return
    
    setIsMarkingAsRead(true)
    setError(null)
    
    try {
      // First save to stories table
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .insert({
          content: text,
          title: text.split('\n')[0].slice(0, 50) || 'Untitled Transcript',
          content_type: 'transcript',
          word_count: wordCount,
          created_at: new Date().toISOString(),
          difficulty: null
        })
        .select()
        .single()

      if (storyError) throw storyError

      // Then mark as read to update stats
      await markStoryAsRead(story)
      
      // Trigger stats update
      window.dispatchEvent(new Event('statsUpdated'))
      
    } catch (error) {
      console.error('Error marking transcript as read:', error)
      setError('Failed to save reading progress')
    } finally {
      setIsMarkingAsRead(false)
    }
  }

  const handleAnalyze = async () => {
    if (!text.trim()) return
    
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const response = await fetch('/api/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      setAnalysisItems(data.items)
    } catch (error) {
      console.error('Analysis error:', error)
      setError('Failed to analyze text')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Transcript Analysis</h1>

      <div className="mb-8">
        <StatsOverview />
      </div>

      <div className="mb-8">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your Spanish text here..."
          className="w-full h-40 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {wordCount} words
          </span>
          
          <div className="space-x-4">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !text.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
            </button>

            <button
              onClick={handleMarkAsRead}
              disabled={isMarkingAsRead || !text.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                'Add to Reading History'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 text-red-600 bg-red-50 p-4 rounded-lg">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Text display and word selection */}
        <div className="relative">
          {text && (
            <StoryText
              content={text}
              onWordSelect={(word) => {
                const wordPos = text.toLowerCase().indexOf(word.toLowerCase())
                const beforeContext = text.slice(Math.max(0, wordPos - 100), wordPos).trim()
                const afterContext = text.slice(wordPos + word.length, wordPos + word.length + 100).trim()
                const context = `...${beforeContext} ${word} ${afterContext}...`
                
                setSelectedWord(word)
                setContext(context)
              }}
              selectedWord={selectedWord}
            />
          )}
        </div>

        {/* Analysis results */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Key Phrases and Expressions</h2>
          
          {error && (
            <div className="text-red-600 bg-red-50 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {isAnalyzing ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {analysisItems.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-lg">{item.phrase}</span>
                      <span className="text-sm text-gray-500 ml-2">({item.type})</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedWord(item.phrase)
                        setContext(item.context)
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Look Up
                    </button>
                  </div>
                  <p className="text-gray-700">{item.translation}</p>
                  <p className="text-sm text-gray-600 mt-2 italic">"{item.context}"</p>
                  {item.notes && (
                    <p className="text-sm text-gray-500 mt-2">{item.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DefinitionSidebar
        word={selectedWord}
        context={context}
        onClose={() => setSelectedWord(null)}
      />
    </main>
  )
} 