import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  // Add CORS headers
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  try {
    const { word, context } = await request.json()
    console.log('Received word:', word)
    console.log('Received context:', context)
    
    const prompt = `
You are a Spanish language teacher. Define the Spanish phrase "${word}".

The word/phrase appears in this text: "${context}"

If it is part of a larger phrase or idiomatic expression (like "tener que", "ir a", etc.), mention this in the contextualMeaning.

Return your response in this JSON format:
{
  "definition": "Definition, which MUST be in English",
  "example": "An example sentence in Spanish",
  "exampleTranslation": "Translation of the example sentence",
  "type": "Part of speech (noun, verb, etc.)",
  "infinitive": "If this is a conjugated verb, provide its infinitive form (otherwise omit this field)",
  "notes": "Any additional usage notes or context (optional)",
  "contextualMeaning": "Explain IN ENGLISH how the word is being used in the provided context, especially if it's part of a phrase or has an idiomatic meaning"
}

Important:
- Stick to the language requested for each field
- Keep the definition clear and concise
- Use a natural, common example sentence
- Include any important usage notes
- For conjugated verbs, always include the infinitive form
- If the word appears in a common phrase in the context, mention this
- Pay special attention to whether the word is part of a larger phrase or expression
- The contextualMeaning should explain how the word is actually being used in the given context
- Return ONLY the JSON, no other text
`

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    // Parse the JSON from Claude's response
    const definition = JSON.parse(response.content[0].text)
    
    return NextResponse.json(definition, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    })

  } catch (error) {
    console.error('Definition error:', error)
    return NextResponse.json(
      { error: 'Failed to get definition' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
} 