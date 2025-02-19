'use client'

import { useState } from 'react'
import { Definition } from '@/types'
import { fetchDefinition } from '@/utils/dictionary'

interface AddWordModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (entry: {
    word: string
    definition: string
    example: string
    example_translation: string
    infinitive: string | null
  }) => Promise<void>
}

export function AddWordModal({ isOpen, onClose, onSave }: AddWordModalProps) {
  const [word, setWord] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [definition, setDefinition] = useState<Definition | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const handleLookup = async () => {
    if (!word.trim()) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const def = await fetchDefinition(word.trim())
      setDefinition(def)
      setIsEditing(true)
    } catch (error) {
      setError('Failed to fetch definition. Please try again.')
      console.error('Error fetching definition:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!definition) return

    try {
      await onSave({
        word: word.trim(),
        definition: definition.definition,
        example: definition.example,
        example_translation: definition.exampleTranslation,
        infinitive: definition.infinitive || null
      })
      
      // Reset form
      setWord('')
      setDefinition(null)
      setIsEditing(false)
      onClose()
    } catch (error) {
      setError('Failed to save word. Please try again.')
      console.error('Error saving word:', error)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div 
          className="relative mx-auto max-w-xl w-full bg-white rounded-xl p-6"
          onClick={e => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold mb-4">
            Add New Word
          </h2>

          <div className="space-y-4">
            {!isEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder="Enter word or phrase"
                  className="flex-1 form-input rounded-md border-gray-300"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleLookup()
                  }}
                />
                <button
                  onClick={handleLookup}
                  disabled={isLoading || !word.trim()}
                  className="btn-primary"
                >
                  {isLoading ? 'Looking up...' : 'Look up'}
                </button>
              </div>
            ) : definition && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Definition
                  </label>
                  <textarea
                    value={definition.definition}
                    onChange={(e) => setDefinition({
                      ...definition,
                      definition: e.target.value
                    })}
                    className="w-full form-textarea rounded-md border-gray-300"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Example
                  </label>
                  <textarea
                    value={definition.example}
                    onChange={(e) => setDefinition({
                      ...definition,
                      example: e.target.value
                    })}
                    className="w-full form-textarea rounded-md border-gray-300"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Example Translation
                  </label>
                  <textarea
                    value={definition.exampleTranslation}
                    onChange={(e) => setDefinition({
                      ...definition,
                      exampleTranslation: e.target.value
                    })}
                    className="w-full form-textarea rounded-md border-gray-300"
                    rows={2}
                  />
                </div>

                {definition.type === 'verb' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Infinitive
                    </label>
                    <input
                      type="text"
                      value={definition.infinitive || ''}
                      onChange={(e) => setDefinition({
                        ...definition,
                        infinitive: e.target.value
                      })}
                      className="w-full form-input rounded-md border-gray-300"
                    />
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setWord('')
                setDefinition(null)
                setIsEditing(false)
                setError(null)
                onClose()
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            {isEditing && (
              <button
                onClick={handleSave}
                className="btn-primary"
              >
                Save to Dictionary
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 