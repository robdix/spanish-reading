export interface Translation {
  id: string
  originalText: string
  translatedText: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  createdAt: string
  userId: string
  wordCount: number
} 