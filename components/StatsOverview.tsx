'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'

interface Stats {
  todayWords: number
  allTimeWords: number
  storiesCompleted: number
  streak: number
  dailyGoal: number | null
  overallGoal: number | null
}

interface Props {
  className?: string
}

export function StatsOverview({ className = '' }: Props) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isEditingDaily, setIsEditingDaily] = useState(false)
  const [isEditingOverall, setIsEditingOverall] = useState(false)
  const [newDailyGoal, setNewDailyGoal] = useState<string>('')
  const [newOverallGoal, setNewOverallGoal] = useState<string>('')

  useEffect(() => {
    fetchStats()
    window.addEventListener('statsUpdated', fetchStats)
    return () => window.removeEventListener('statsUpdated', fetchStats)
  }, [])

  async function fetchStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date().toISOString().split('T')[0]
      
      // Get today's stats
      const { data: todayStats } = await supabase
        .from('reading_stats')
        .select('words_read')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle()

      // Get all-time stats
      const { data: allTimeStats } = await supabase
        .from('reading_stats')
        .select('words_read, stories_completed, date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      // Calculate streak
      let streak = 0
      let currentDate = new Date()
      
      for (const stat of allTimeStats || []) {
        const statDate = new Date(stat.date)
        const dayDiff = Math.floor((currentDate.getTime() - statDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (dayDiff === streak && stat.words_read > 0) {
          streak++
          currentDate = statDate
        } else {
          break
        }
      }

      const totalWords = allTimeStats?.reduce((sum, stat) => sum + (stat.words_read || 0), 0) || 0
      const totalStories = allTimeStats?.reduce((sum, stat) => sum + (stat.stories_completed || 0), 0) || 0

      // Get current goals
      const { data: goalData } = await supabase
        .from('user_goal_history')
        .select('daily_words')
        .eq('user_id', user.id)
        .order('effective_from', { ascending: false })
        .limit(1)

      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('overall_goal')
        .eq('user_id', user.id)
        .single()

      setStats({
        todayWords: todayStats?.words_read || 0,
        allTimeWords: totalWords,
        storiesCompleted: totalStories,
        streak,
        dailyGoal: goalData?.[0]?.daily_words || null,
        overallGoal: userSettings?.overall_goal || null
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  async function handleDailyGoalSubmit(e: React.FormEvent) {
    e.preventDefault()
    const goal = parseInt(newDailyGoal)
    if (isNaN(goal) || goal < 1) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('user_goal_history')
        .insert({
          user_id: user.id,
          daily_words: goal,
          effective_from: new Date().toISOString()
        })

      if (error) throw error

      setStats(prev => prev ? { ...prev, dailyGoal: goal } : prev)
      setIsEditingDaily(false)
    } catch (error) {
      console.error('Error updating daily goal:', error)
    }
  }

  async function handleOverallGoalSubmit(e: React.FormEvent) {
    e.preventDefault()
    const goal = parseInt(newOverallGoal)
    if (isNaN(goal) || goal < 1) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          overall_goal: goal,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error

      setStats(prev => prev ? { ...prev, overallGoal: goal } : prev)
      setIsEditingOverall(false)
    } catch (error) {
      console.error('Error updating overall goal:', error)
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 p-4 ${className}`}>
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="relative">
            <p className="text-2xl font-bold text-green-600">
              {stats?.todayWords.toLocaleString()}
              {stats?.dailyGoal && (
                <span className="text-sm text-gray-500 ml-1">
                  /{stats.dailyGoal.toLocaleString()}
                </span>
              )}
            </p>
            {isEditingDaily ? (
              <form onSubmit={handleDailyGoalSubmit} className="mt-1">
                <input
                  type="number"
                  min="1"
                  value={newDailyGoal}
                  onChange={e => setNewDailyGoal(e.target.value)}
                  className="w-20 text-sm border rounded px-2 py-1"
                  placeholder="Goal"
                />
                <div className="flex gap-1 mt-1 justify-center">
                  <button type="submit" className="text-xs text-green-600">✓</button>
                  <button type="button" onClick={() => setIsEditingDaily(false)} className="text-xs text-red-600">×</button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => {
                  setIsEditingDaily(true)
                  setNewDailyGoal(stats?.dailyGoal?.toString() || '')
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {stats?.dailyGoal ? 'Edit Goal' : 'Set Goal'}
              </button>
            )}
          </div>
          <p className="text-sm font-medium text-gray-500">Today</p>
        </div>
        
        <div className="text-center border-l border-gray-100 pl-4">
          <div className="relative">
            <p className="text-2xl font-bold text-blue-600">
              {stats?.allTimeWords.toLocaleString()}
              {stats?.overallGoal && (
                <span className="text-sm text-gray-500 ml-1">
                  /{stats.overallGoal.toLocaleString()}
                </span>
              )}
            </p>
            {isEditingOverall ? (
              <form onSubmit={handleOverallGoalSubmit} className="mt-1">
                <input
                  type="number"
                  min="1"
                  value={newOverallGoal}
                  onChange={e => setNewOverallGoal(e.target.value)}
                  className="w-20 text-sm border rounded px-2 py-1"
                  placeholder="Goal"
                />
                <div className="flex gap-1 mt-1 justify-center">
                  <button type="submit" className="text-xs text-green-600">✓</button>
                  <button type="button" onClick={() => setIsEditingOverall(false)} className="text-xs text-red-600">×</button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => {
                  setIsEditingOverall(true)
                  setNewOverallGoal(stats?.overallGoal?.toString() || '')
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {stats?.overallGoal ? 'Edit Goal' : 'Set Goal'}
              </button>
            )}
          </div>
          <p className="text-sm font-medium text-gray-500">Total Words</p>
        </div>
        
        <div className="text-center border-l border-gray-100 pl-4">
          <p className="text-2xl font-bold text-purple-600">
            {stats?.storiesCompleted.toLocaleString()}
          </p>
          <p className="text-sm font-medium text-gray-500">Complete</p>
        </div>
        
        <div className="text-center border-l border-gray-100 pl-4">
          <p className="text-2xl font-bold text-orange-600">
            {stats?.streak}
          </p>
          <p className="text-sm font-medium text-gray-500">Streak</p>
        </div>
      </div>
    </div>
  )
} 