'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'

interface VocabularyEntry {
  id: string
  word: string
  definition: string
  example: string
  example_translation: string
  infinitive: string | null
}

function DictionaryEntry({ entry, onDelete }: { entry: VocabularyEntry, onDelete: (id: string) => void }) {
  const [isConfirming, setIsConfirming] = useState(false)

  return (
    <div key={entry.id} className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-serif font-bold text-gray-900">
            {entry.word}
            {entry.infinitive && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({entry.infinitive})
              </span>
            )}
          </h2>
          <p className="text-gray-700 mt-2">{entry.definition}</p>
        </div>
        <div className="flex items-center gap-2">
          {isConfirming ? (
            <>
              <button
                onClick={() => onDelete(entry.id)}
                className="text-sm px-3 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setIsConfirming(false)}
                className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsConfirming(true)}
              className="text-gray-400 hover:text-red-600 transition-colors"
              aria-label="Delete word"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="mt-4 bg-gray-50 rounded p-4">
        <p className="font-medium text-gray-900 italic">{entry.example}</p>
        <p className="text-gray-600 mt-2">{entry.example_translation}</p>
      </div>
    </div>
  )
}

export default function DictionaryPage() {
  const [entries, setEntries] = useState<VocabularyEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_vocabulary')
        .select('*')
        .eq('user_id', user.id)
        .order('word')

      if (error) throw error
      setEntries(data)
    } catch (error) {
      console.error('Error fetching dictionary:', error)
      setError('Failed to load dictionary')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('user_vocabulary')
        .delete()
        .match({ 
          id: id,
          user_id: user.id 
        })

      if (error) {
        console.error('Supabase deletion error:', error)
        throw error
      }

      setEntries(entries.filter(entry => entry.id !== id))
    } catch (error) {
      console.error('Error deleting entry:', error)
      setError('Failed to delete entry')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Dictionary</h1>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-lg shadow"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Dictionary</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {entries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No words saved yet. Click any word while reading to look it up and save it to your dictionary.
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <DictionaryEntry 
                key={entry.id} 
                entry={entry} 
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 