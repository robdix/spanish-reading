import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildPrompt } from '@/utils/prompts/builder'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { contentType, difficulty, length, topic } = body

    const prompt = buildPrompt({ contentType, difficulty, length, topic })
    
    console.log('=== API Request ===')
    console.log('Prompt:', prompt)

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    console.log('=== API Response ===')
    console.log('Full response:', JSON.stringify(response, null, 2))
    console.log('Content array:', response.content)
    console.log('First content item:', response.content[0])
    console.log('Text of first content:', response.content[0].text)

    return NextResponse.json({ 
      content: response.content[0].text,
      prompt // Useful for debugging prompts during development
    })

  } catch (error) {
    console.error('=== API Error ===')
    console.error('Story generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    )
  }
} 