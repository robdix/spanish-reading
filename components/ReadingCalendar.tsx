'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'

interface DayStats {
  date: string
  words_read: number
  goal?: number | null
}

export function ReadingCalendar() {
  const [monthStats, setMonthStats] = useState<DayStats[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    fetchMonthStats()
  }, [currentDate])

  async function fetchMonthStats() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('Auth error:', authError)
        return
      }
      if (!user) {
        console.error('No user found')
        return
      }

      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      console.log('Fetching stats for:', {
        user_id: user.id,
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0]
      })

      // Get reading stats for the month
      const { data: readingData, error: readingError } = await supabase
        .from('reading_stats')
        .select('date, words_read')
        .eq('user_id', user.id)
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0])

      if (readingError) {
        console.error('Reading stats error:', readingError)
        throw readingError
      }

      console.log('Reading data:', readingData)

      // Get all goal changes that could affect this month
      const { data: goalData, error: goalError } = await supabase
        .from('user_goal_history')
        .select('daily_words, effective_from')
        .eq('user_id', user.id)
        .lte('effective_from', endOfMonth.toISOString())
        .order('effective_from', { ascending: true })

      if (goalError && goalError.code !== 'PGRST116') {
        console.error('Goal history error:', goalError)
        throw goalError
      }

      console.log('Goal data:', goalData)

      // For each reading stat, find the goal that was active on that day
      const statsWithGoals = readingData.map(stat => {
        const activeGoal = goalData
          ?.filter(g => new Date(g.effective_from) <= new Date(stat.date))
          ?.slice(-1)[0]
        
        return {
          ...stat,
          goal: activeGoal?.daily_words
        }
      })

      setMonthStats(statsWithGoals || [])
    } catch (error) {
      console.error('Error in fetchMonthStats:', error)
    }
  }

  function getDaysInMonth() {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []

    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }

    // Add all days in the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i).toISOString().split('T')[0]
      const stats = monthStats.find(stat => stat.date === date)
      days.push({
        date,
        day: i,
        words: stats?.words_read || 0,
        goal: stats?.goal
      })
    }

    return days
  }

  function getDayColor(words: number, goal: number | null | undefined) {
    if (words === 0) return 'bg-gray-50 hover:bg-gray-100'
    if (!goal) return 'bg-green-200 hover:bg-green-300' // If no goal was set, treat any reading as success
    if (words >= goal) return 'bg-green-200 hover:bg-green-300'
    return 'bg-orange-200 hover:bg-orange-300'
  }

  const days = getDaysInMonth()
  const monthName = currentDate.toLocaleString('default', { month: 'long' })
  const year = currentDate.getFullYear()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
          className="text-gray-600 hover:text-gray-900"
        >
          ←
        </button>
        <h2 className="text-lg font-medium">
          {monthName} - {year}
        </h2>
        <button
          onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
          className="text-gray-600 hover:text-gray-900"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500">
            {day[0]}
          </div>
        ))}
        
        {days.map((day, index) => (
          <div key={index} className="aspect-square">
            {day ? (
              <div 
                className={`h-full p-1 rounded-lg ${getDayColor(day.words, day.goal)}`}
                title={day.goal 
                  ? `${day.words.toLocaleString()} / ${day.goal.toLocaleString()} words`
                  : day.words > 0 
                    ? `${day.words.toLocaleString()} words`
                    : undefined
                }
              >
                <div className="text-xs font-medium text-gray-900">
                  {day.day}
                </div>
                {day.words > 0 && (
                  <div className="text-xs text-gray-600">
                    {day.words.toLocaleString()}
                    {day.goal && (
                      <span className="text-gray-400">
                        /{day.goal.toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full bg-transparent" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 