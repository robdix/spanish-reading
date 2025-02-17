// Database types that match our Supabase schema
export interface Story {
  id: string
  content: string
  title: string
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  content_type: 'story' | 'news' | 'dialogue' | 'wikipedia' | 'transcript'
  word_count: number
  created_at: string
}

export interface UserStory {
  id: string
  user_id: string
  story_id: string
  status: 'read' | 'saved' | 'in_progress'
  words_read: number
  completed_at: string | null
  created_at: string
  last_read_at: string
}

export interface UserVocabulary {
  id: string
  user_id: string
  word: string
  first_seen_at: string
  last_seen_at: string
  occurrence_count: number
  lookup_count: number
  contexts: Array<{
    story_id: string
    sentence: string
    seen_at: string
  }>
  created_at: string
}

export interface ReadingStats {
  id: string
  user_id: string
  date: string
  words_read: number
  stories_completed: number
  created_at: string
  updated_at: string
} 