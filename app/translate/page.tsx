'use client'

import { useState, useEffect } from 'react'
import { DefinitionSidebar } from '@/components/DefinitionSidebar'
import { StoryDisplay } from '@/components/StoryDisplay'
import { StatsOverview } from '@/components/StatsOverview'
import { Notification } from '@/components/Notification'
import { supabase } from '@/utils/supabase'
import { markStoryAsRead } from '@/utils/reading'

type Difficulty = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

interface AnalysisItem {
  phrase: string
  type: 'word' | 'idiom' | 'collocation'
  translation: string
  context: string
  notes?: string
}

export default function TranslatePage({
  searchParams
}: {
  searchParams: { text?: string, level?: string, source?: string }
}) {
  // If coming from extension, use the URL parameters
  const [text, setText] = useState(searchParams.text || '')
  const [translation, setTranslation] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>(
    (searchParams.level as Difficulty) || 'B1'
  )
  const [error, setError] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [context, setContext] = useState<string>('')
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [analysisItems, setAnalysisItems] = useState<AnalysisItem[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Auto-translate when coming from extension
  useEffect(() => {
    if (searchParams.source === 'extension' && text && !translation) {
      // Create a synthetic event that matches React's FormEvent type
      const syntheticEvent = {
        preventDefault: () => {},
        target: document.createElement('form')
      } as React.FormEvent<HTMLFormElement>
      
      handleTranslate(syntheticEvent)
    }
  }, []) // Run once on mount

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    setIsTranslating(true)
    setError(null)
    setTranslation(null)
    setAnalysisItems([])

    try {
      // First get the translation
      const translationRes = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          from: 'en',
          to: 'es',
          level: difficulty
        })
      })
      
      if (!translationRes.ok) {
        const errorData = await translationRes.json()
        throw new Error(errorData.error || 'Translation failed')
      }

      const translationData = await translationRes.json()
      setTranslation(translationData.translation)

      // Only proceed with analysis if we have a translation
      if (translationData.translation) {
        const analysisRes = await fetch('/api/analyze-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: translationData.translation,
            isTranslation: true
          })
        })
        
        if (!analysisRes.ok) {
          const errorData = await analysisRes.json()
          console.error('Analysis error:', errorData)
          // Don't throw here, just log the analysis error
        } else {
          const analysisData = await analysisRes.json()
          setAnalysisItems(analysisData.items)
        }
      }
    } catch (err) {
      console.error('Translation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to translate text')
    } finally {
      setIsTranslating(false)
    }
  }

  const handleSave = async () => {
    if (!translation || !text.trim()) return
    
    setIsSaving(true)
    setError(null)
    setNotification(null)
    
    try {
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .insert({
          content: `ORIGINAL:\n${text}\n\nTRANSLATION:\n${translation}`,
          title: text.split('\n')[0].slice(0, 50) || 'Untitled Translation',
          content_type: 'translate',
          word_count: translation.split(/\s+/).length,
          difficulty,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (storyError) throw storyError

      await markStoryAsRead(story)
      window.dispatchEvent(new Event('statsUpdated'))
      setNotification({
        type: 'success',
        message: 'Translation saved! Your progress has been updated.'
      })
      
    } catch (error) {
      console.error('Error saving translation:', error)
      setError('Failed to save translation')
      setNotification({
        type: 'error',
        message: 'Failed to save translation. Please try again.'
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Translate to Spanish</h1>
      
      <div className="mb-8">
        <StatsOverview />
      </div>
      
      <form onSubmit={handleTranslate} className="space-y-4 mb-8">
        <div>
          <label className="block mb-2 font-medium">Language Level:</label>
          <select 
            value={difficulty}
            onChange={e => setDifficulty(e.target.value as Difficulty)}
            className="form-select rounded-md border-gray-300 shadow-sm w-full max-w-xs"
          >
            <option value="A1">A1 (Beginner)</option>
            <option value="A2">A2 (Elementary)</option>
            <option value="B1">B1 (Intermediate)</option>
            <option value="B2">B2 (Upper Intermediate)</option>
            <option value="C1">C1 (Advanced)</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">English Text:</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            className="form-textarea w-full h-40 rounded-md border-gray-300 shadow-sm"
            placeholder="Paste English text here..."
          />
        </div>

        <button 
          type="submit" 
          disabled={isTranslating || !text.trim()}
          className="btn-primary"
        >
          {isTranslating ? 'Translating...' : 'Translate'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {translation && (
        <div className="space-y-8">
          <StoryDisplay
            content={translation}
            error={null}
            isLoading={false}
            isMarkingAsRead={isSaving}
            onWordSelect={(word, context) => {
              setSelectedWord(word)
              setContext(context)
            }}
            selectedWord={selectedWord}
            onMarkAsRead={handleSave}
            isRead={false}
          />

          {analysisItems.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Key Phrases and Expressions</h2>
              <div className="space-y-4">
                {analysisItems.map((item, index) => (
                  <div key={index} className="border-b pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span 
                          className="text-blue-600 cursor-pointer hover:underline"
                          onClick={() => {
                            setSelectedWord(item.phrase)
                            setContext(item.context)
                          }}
                        >
                          {item.phrase}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="text-gray-600">{item.translation}</span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                        {item.type}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1 italic">
                      "{item.context}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <DefinitionSidebar
        word={selectedWord}
        context={context}
        onClose={() => setSelectedWord(null)}
      />

      {notification && (
        <Notification
          {...notification}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  )
} 