import { supabase } from './supabase'
import type { Story } from '@/types/database'

export async function markStoryAsRead(story: Story) {
  console.log('Starting markStoryAsRead with story:', story)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('Current user:', user)
  if (!user) throw new Error('User not authenticated')

  // Start a transaction
  console.log('Inserting into user_stories...')
  const { data: userStory, error: userStoryError } = await supabase
    .from('user_stories')
    .insert({
      user_id: user.id,
      story_id: story.id,
      status: 'read',
      words_read: story.word_count,
      completed_at: new Date().toISOString()
    })
    .select()
    .single()

  if (userStoryError) {
    console.error('Error inserting user_story:', userStoryError)
    throw userStoryError
  }
  console.log('Successfully inserted user_story:', userStory)

  // Update reading stats for today
  const today = new Date().toISOString().split('T')[0]
  console.log('Fetching existing stats for:', today)

  const { data: existingStats, error: fetchError } = await supabase
    .from('reading_stats')
    .select('words_read, stories_completed')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  console.log('Existing stats:', existingStats, 'Fetch error:', fetchError)
  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching stats:', fetchError)
    throw fetchError
  }

  console.log('Upserting reading_stats...')
  const { error: statsError } = await supabase
    .from('reading_stats')
    .upsert({
      user_id: user.id,
      date: today,
      words_read: (existingStats?.words_read || 0) + story.word_count,
      stories_completed: (existingStats?.stories_completed || 0) + 1,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,date',
      ignoreDuplicates: false
    })

  if (statsError) {
    console.error('Error upserting stats:', statsError)
    throw statsError
  }
  console.log('Successfully updated reading stats')

  return userStory
} 