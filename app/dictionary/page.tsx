'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { AnkiExportModal } from '@/components/AnkiExportModal'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { AddWordModal } from '@/components/AddWordModal'

interface VocabularyEntry {
  id: string
  word: string
  definition: string
  example: string
  example_translation: string
  infinitive: string | null
  exported_at: string | null
}

function DictionaryEntry({ entry, onDelete, onToggleExported }: { 
  entry: VocabularyEntry, 
  onDelete: (id: string) => void,
  onToggleExported: (id: string, exported: boolean) => void 
}) {
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
          <button
            onClick={() => onToggleExported(entry.id, !entry.exported_at)}
            className={`p-1 rounded-full transition-colors ${
              entry.exported_at 
                ? 'text-green-600 hover:text-green-700' 
                : 'text-gray-300 hover:text-gray-400'
            }`}
            title={entry.exported_at ? 'Exported to Anki' : 'Not exported'}
          >
            <CheckCircleIcon className="w-6 h-6" />
          </button>
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
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(false)

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

  const handleToggleExported = async (id: string, exported: boolean) => {
    try {
      const { error } = await supabase
        .from('user_vocabulary')
        .update({ 
          exported_at: exported ? new Date().toISOString() : null 
        })
        .eq('id', id)

      if (error) throw error

      setEntries(entries.map(entry => 
        entry.id === id 
          ? { ...entry, exported_at: exported ? new Date().toISOString() : null }
          : entry
      ))
    } catch (error) {
      console.error('Error updating export status:', error)
    }
  }

  const handleExport = async (fieldMappings: { fields: string[], separator: string }[], exportType: 'all' | 'new') => {
    // Get all dictionary entries
    const { data: entriesToExport, error } = await supabase
      .from('user_vocabulary')
      .select('*')
      .order('word')
      .is('exported_at', exportType === 'new' ? null : undefined)

    if (error) {
      console.error('Error fetching entries:', error)
      return
    }

    if (!entriesToExport || entriesToExport.length === 0) {
      return // No entries to export
    }

    // Create the export content
    const headers = [
      '#separator:Semicolon',
      '#html:true',
      ''  // Empty line after headers
    ].join('\n')

    const content = entriesToExport.map(entry => {
      return fieldMappings.map(mapping => {
        // Combine all fields with their separator
        const combinedValue = mapping.fields
          .map(field => {
            if (!field) return ''
            
            let value = entry[field] || ''
            
            // Special handling for example field to bold the word
            if (field === 'example' && value) {
              const wordPattern = new RegExp(`(${entry.word})`, 'gi')
              value = value.replace(wordPattern, '<b>$1</b>')
              
              if (entry.infinitive) {
                const infinitivePattern = new RegExp(`(${entry.infinitive})`, 'gi')
                value = value.replace(infinitivePattern, '<b>$1</b>')
              }
            }
            
            return value
          })
          .filter(Boolean) // Remove empty values
          .join(mapping.separator)

        // Escape semicolons and quotes
        if (combinedValue.includes(';') || combinedValue.includes('"')) {
          return `"${combinedValue.replace(/"/g, '""')}"`
        }

        return combinedValue
      }).join(';')
    }).join('\n')

    // Create and download the file
    const blob = new Blob([headers + content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'anki-export.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // After successful export, mark entries as exported
    const { error: updateError } = await supabase
      .from('user_vocabulary')
      .update({ exported_at: new Date().toISOString() })
      .in('id', entriesToExport.map(e => e.id))

    if (!updateError) {
      // Update local state
      setEntries(currentEntries => 
        currentEntries.map(entry => 
          entriesToExport.some(e => e.id === entry.id)
            ? { ...entry, exported_at: new Date().toISOString() }
            : entry
        )
      )
    }
  }

  const handleAddWord = async (entry: {
    word: string
    definition: string
    example: string
    example_translation: string
    infinitive: string | null
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_vocabulary')
        .upsert({
          user_id: user.id,
          ...entry
        }, {
          onConflict: 'user_id,word',
          ignoreDuplicates: false
        })

      if (error) throw error

      // Refresh entries
      await fetchEntries()
    } catch (error) {
      console.error('Error adding word:', error)
      throw error
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

        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Dictionary</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setIsAddWordModalOpen(true)}
              className="btn-secondary"
            >
              Add Word
            </button>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="btn-primary"
            >
              Export to Anki
            </button>
          </div>
        </div>

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
                onToggleExported={handleToggleExported}
              />
            ))}
          </div>
        )}
      </div>

      <AddWordModal
        isOpen={isAddWordModalOpen}
        onClose={() => setIsAddWordModalOpen(false)}
        onSave={handleAddWord}
      />

      <AnkiExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        newEntriesCount={entries.filter(e => !e.exported_at).length}
        totalEntriesCount={entries.length}
      />
    </div>
  )
} 