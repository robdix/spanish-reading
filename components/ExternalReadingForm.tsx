'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'

interface Props {
  onSuccess?: () => void
  onCancel?: () => void
}

export function ExternalReadingForm({ onSuccess, onCancel }: Props) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [wordCount, setWordCount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!wordCount || parseInt(wordCount) < 1) return
    
    setIsSubmitting(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get existing stats for this date
      const { data: existingStats } = await supabase
        .from('reading_stats')
        .select('words_read')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle()

      if (existingStats) {
        // Update existing record
        await supabase
          .from('reading_stats')
          .update({ 
            words_read: existingStats.words_read + parseInt(wordCount),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('date', date)
      } else {
        // Create new record
        await supabase
          .from('reading_stats')
          .insert({
            user_id: user.id,
            date,
            words_read: parseInt(wordCount),
            stories_completed: 0
          })
      }

      // Trigger stats refresh
      window.dispatchEvent(new Event('statsUpdated'))
      onSuccess?.()
    } catch (error) {
      console.error('Error logging external reading:', error)
      setError('Failed to log reading')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Log External Reading</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            max={new Date().toISOString().split('T')[0]}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Words Read
          </label>
          <input
            type="number"
            min="1"
            value={wordCount}
            onChange={(e) => setWordCount(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Enter number of words"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Reading'}
          </button>
        </div>
      </form>
    </div>
  )
} 