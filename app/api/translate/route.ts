import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  try {
    const { text, from, to, level } = await request.json()
    
    console.log('=== Translation Request ===')
    console.log('Input text length:', text.length)
    console.log('First 100 chars:', text.slice(0, 100))
    console.log('Last 100 chars:', text.slice(-100))

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `You are a Spanish language teacher. Translate the following text from ${from} to ${to}.

Important guidelines:
- Use vocabulary and grammar appropriate for ${level} level Spanish learners
- Maintain the original tone and style
- Keep the same paragraph structure
- Preserve any formatting
- ONLY respond with the translation: no additional text, introduction, or explanation. Any additional text other than the translation will result in your response being rejected.

Text to translate:

${text}`
      }]
    })

    console.log('=== Translation Response ===')
    console.log('Response length:', response.content[0].text.length)
    console.log('First 100 chars:', response.content[0].text.slice(0, 100))
    console.log('Last 100 chars:', response.content[0].text.slice(-100))

    return NextResponse.json({ 
      translation: response.content[0].text
    })

  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    )
  }
} 