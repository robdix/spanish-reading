import { basePrompt } from './base'
import { wikipediaPrompt } from './types/wikipedia'
import { storyPrompt } from './types/story'
import { newsPrompt } from './types/news'
import { dialoguePrompt } from './types/dialogue'

const CONTENT_TYPE_PROMPTS = {
  'wikipedia': wikipediaPrompt,
  'story': storyPrompt,
  'news': newsPrompt,
  'dialogue': dialoguePrompt
} as const

const contentTypeLabels = {
  'wikipedia': 'Wikipedia-style article',
  'story': 'story',
  'news': 'news article',
  'dialogue': 'dialogue'
} as const

export type StoryLength = 'short' | 'medium' | 'long'

export function buildPrompt(params: {
  contentType: keyof typeof CONTENT_TYPE_PROMPTS
  difficulty: string
  length: StoryLength
  topic: string
}) {
  const { contentType, difficulty, length, topic } = params
  
  // Get the base structure requirements
  const structure = basePrompt(difficulty, length)
  
  // Get the style guidelines for the content type
  const style = CONTENT_TYPE_PROMPTS[contentType](topic)
  
  // Combine them into a single coherent prompt
  return `
You are a Spanish language teacher creating content for students.
Task: Create a ${length} ${contentTypeLabels[contentType]} in Spanish.
Level: Appropriate for ${difficulty} level students.

${structure}

${style}

Remember: Strictly follow the length requirements specified above. The content MUST match the requested length.
`
} 