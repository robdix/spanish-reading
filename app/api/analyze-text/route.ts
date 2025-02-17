import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  try {
    const { text } = await request.json()
    
    const prompt = `
You are a Spanish language teacher helping intermediate (B1-B2) students understand a text.

Analyze this Spanish text and identify:
1. Key words and phrases that are essential for understanding the main points
2. Idiomatic expressions and collocations
3. Advanced or uncommon vocabulary that intermediate learners might not know

Focus on items that would be most valuable for a B1-B2 learner to add to their vocabulary.

Return your analysis as a JSON array of items in this format:
{
  "items": [
    {
      "phrase": "the word or phrase in Spanish",
      "type": "word" | "idiom" | "collocation",
      "translation": "English translation",
      "context": "the sentence or fragment where this appears",
      "notes": "optional explanation of usage or cultural context"
    }
  ]
}

Text to analyze: "${text}"

Important:
- Include 5-10 items maximum
- Focus on phrases that are both useful and challenging
- Provide natural context from the original text
- Explain any cultural or usage nuances in the notes
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

    const analysis = JSON.parse(response.content[0].text)
    return NextResponse.json(analysis)

  } catch (error) {
    console.error('Text analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze text' },
      { status: 500 }
    )
  }
} 