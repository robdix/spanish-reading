'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'

interface Definition {
  definition: string
  example: string
  exampleTranslation: string
  type: string
  infinitive?: string
  notes?: string
  contextualMeaning?: string
}

interface DefinitionSidebarProps {
  word: string | null
  context: string
  onClose: () => void
}

export function DefinitionSidebar({ word, context, onClose }: DefinitionSidebarProps) {
  const [definition, setDefinition] = useState<Definition | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (!word) {
      setDefinition(null)
      return
    }

    async function fetchDefinition() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/define', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word, context })
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        setDefinition(data)
      } catch (error) {
        console.error('Definition error:', error)
        setError('Failed to fetch definition')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDefinition()
  }, [word, context])

  async function handleSaveToDictionary() {
    if (!word || !definition) return
    
    setIsSaving(true)
    setSaveSuccess(false)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('user_vocabulary')
        .upsert({
          user_id: user.id,
          word: word,
          definition: definition.definition,
          example: definition.example,
          example_translation: definition.exampleTranslation,
          infinitive: definition.infinitive || null
        }, {
          onConflict: 'user_id,word',
          ignoreDuplicates: false
        })

      if (error) throw error
      setSaveSuccess(true)
    } catch (error) {
      console.error('Error saving to dictionary:', error)
      setError('Failed to save to dictionary')
    } finally {
      setIsSaving(false)
    }
  }

  if (!word) return null

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg border-l border-gray-200 p-6 overflow-y-auto transition-transform duration-200 ease-in-out transform">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">{word}</h2>
          {definition?.type === 'verb' && definition.infinitive && (
            <p className="text-sm text-gray-500 mt-1">({definition.infinitive})</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {definition && (
            <button
              onClick={handleSaveToDictionary}
              disabled={isSaving || saveSuccess}
              className={`text-sm px-3 py-1 rounded transition-colors ${
                saveSuccess 
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
              }`}
            >
              {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save to Dictionary'}
            </button>
          )}
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ) : error ? (
          <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
        ) : definition ? (
          <>
            <div>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {definition.type}
              </span>
              <p className="mt-2 text-gray-900 leading-relaxed">
                {definition.definition}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900 italic">
                {definition.example}
              </p>
              <p className="text-gray-600 mt-2">
                {definition.exampleTranslation}
              </p>
            </div>
            
            {definition.notes && (
              <div className="border-l-4 border-gray-200 pl-4">
                <p className="text-gray-600 text-sm">
                  {definition.notes}
                </p>
              </div>
            )}
            
            {definition.contextualMeaning && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">
                  In this context:
                </h3>
                <p className="text-blue-800">
                  {definition.contextualMeaning}
                </p>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
} 