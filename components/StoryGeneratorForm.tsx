'use client'

import { useState } from 'react'
import { StoryDisplay } from './StoryDisplay'
import { DefinitionSidebar } from './DefinitionSidebar'
import { Notification } from './Notification'
import { supabase } from '@/utils/supabase'
import { markStoryAsRead } from '@/utils/reading'
import { StoryLength } from '@/utils/prompts/builder'

type Difficulty = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
type ContentType = 'story' | 'news' | 'dialogue' | 'wikipedia'

interface FormData {
  contentType: 'story' | 'news' | 'dialogue' | 'wikipedia'
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  length: StoryLength
  topic: string
}

export default function StoryGeneratorForm() {
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    difficulty: 'B1',
    contentType: 'story',
    length: 'medium'
  })
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [context, setContext] = useState<string>('')
  const [isRead, setIsRead] = useState(false)
  const [markingAsRead, setMarkingAsRead] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setError(null)
    setContent(null)
    setSelectedWord(null)
    setIsRead(false)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to generate story')
      
      setContent(data.content)
    } catch (error) {
      console.error('Generation error:', error)
      setError(error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Topic Input */}
          <div className="col-span-full">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
              Topic (optional)
            </label>
            <input
              id="topic"
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="Enter a topic for your story..."
              className="form-input"
            />
          </div>

          {/* Content Type */}
          <div>
            <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-1">
              Content Type
            </label>
            <select
              id="contentType"
              value={formData.contentType}
              onChange={(e) => setFormData({ ...formData, contentType: e.target.value as ContentType })}
              className="form-input"
            >
              <option value="story">Story</option>
              <option value="dialogue">Dialogue</option>
              <option value="news">News Article</option>
              <option value="wikipedia">Wikipedia Article</option>
            </select>
          </div>

          {/* Difficulty Level */}
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty Level
            </label>
            <select
              id="difficulty"
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
              className="form-input"
            >
              <option value="A1">A1 (Beginner)</option>
              <option value="A2">A2 (Elementary)</option>
              <option value="B1">B1 (Intermediate)</option>
              <option value="B2">B2 (Upper Intermediate)</option>
              <option value="C1">C1 (Advanced)</option>
            </select>
          </div>

          {/* Length */}
          <div>
            <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-1">
              Length
            </label>
            <select
              id="length"
              value={formData.length}
              onChange={(e) => setFormData({ ...formData, length: e.target.value as StoryLength })}
              className="form-input"
            >
              <option value="short">Short (2-3 paragraphs)</option>
              <option value="medium">Medium (5-6 paragraphs)</option>
              <option value="long">Long (8-10 paragraphs)</option>
            </select>
          </div>

          {/* Generate Button */}
          <div className="col-span-full">
            <button
              type="submit"
              disabled={isGenerating}
              className="btn-primary w-full justify-center"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Story...
                </>
              ) : (
                'Generate Story'
              )}
            </button>
          </div>
        </div>
      </form>

      <StoryDisplay 
        content={content}
        error={error}
        isLoading={isGenerating}
        selectedWord={selectedWord}
        isRead={isRead}
        isMarkingAsRead={markingAsRead}
        onMarkAsRead={async () => {
          if (!content) return
          setMarkingAsRead(true)
          setNotification(null)
          try {
            console.log('Saving story to database...')
            const { data: story, error: storyError } = await supabase
              .from('stories')
              .insert({
                content,
                title: content.split('\n')[0] || 'Untitled Story',
                difficulty: formData.difficulty,
                content_type: formData.contentType,
                word_count: content.split(/\s+/).length
              })
              .select()
              .single()

            if (storyError) throw storyError

            await markStoryAsRead(story)
            setIsRead(true)
            window.dispatchEvent(new Event('statsUpdated'))
            setNotification({
              type: 'success',
              message: 'Story marked as read! Your progress has been updated.'
            })
          } catch (error) {
            console.error('Error marking as read:', error)
            setNotification({
              type: 'error',
              message: 'Failed to mark story as read. Please try again.'
            })
          } finally {
            setMarkingAsRead(false)
          }
        }}
        onWordSelect={(word, context) => {
          setSelectedWord(word)
          setContext(context)
        }}
      />
      
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