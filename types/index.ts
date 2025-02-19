// Database types (from database.ts)
export * from './database'

// Form types
export type ContentType = 'wikipedia' | 'news' | 'dialogue' | 'story'
export type Length = 'short' | 'medium' | 'long' | 'very-long'
export type Difficulty = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

export interface StoryFormData {
  contentType: ContentType
  topic: string
  length: Length
  difficulty: Difficulty
}

// Word definition types
export interface Definition {
  definition: string
  example: string
  exampleTranslation: string
  type: string
  infinitive?: string
  notes?: string
  contextualMeaning?: string
}

export interface WordStats {
  seenCount: number
  firstSeenAt: Date
  lastSeenAt: Date
  lookupCount: number
}

// API Response types
export interface GenerateStoryResponse {
  content: string
  prompt?: string // For debugging
  error?: string
}

export interface DefinitionResponse {
  definition: Definition
  error?: string
}

// Reading Progress types
export interface ReadingProgress {
  totalWordsRead: number
  storiesCompleted: number
  currentStreak: number
  vocabularyCount: number
}

// User types
export interface UserProfile {
  id: string
  email: string
  dailyGoal?: number
  preferredDifficulty?: Difficulty
  created_at: string
  last_login: string
}

// Analytics types
export interface DailyStats {
  date: string
  wordsRead: number
  storiesCompleted: number
  newVocabulary: number
}

export interface WeeklyProgress {
  weekStart: string
  weekEnd: string
  totalWordsRead: number
  averageWordsPerDay: number
  daysActive: number
}

export interface User {
  id: string
  email: string
  readingStreak: number
  wordsRead: number
  dailyTarget: number
}

export interface Story {
  id: string
  title: string
  content: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  wordCount: number
}

export interface Flashcard {
  id: string
  userId: string
  word: string
  definition: string
  context: string
  createdAt: Date
}

export interface Transcript {
  id: string
  userId: string
  content: string
  title: string
  uploadedAt: Date
} 