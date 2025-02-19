import { Definition } from '@/types'

export async function fetchDefinition(word: string, context?: string): Promise<Definition> {
  const response = await fetch('/api/define', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ word, context }),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch definition')
  }

  return response.json()
} 