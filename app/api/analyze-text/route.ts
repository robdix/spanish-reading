import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  try {
    const { text, isTranslation } = await request.json()
    
    const prompt = isTranslation ? `
You are a Spanish language teacher helping students understand a translated text.

Analyze this Spanish translation and identify:
1. Key vocabulary used in the translation that is necessary for understanding the translation (especially anything specialised, technical, or otherwise unusual)
2. Idiomatic expressions or slang that are used in the translation
3. Grammar patterns that might be new or challenging

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
- Include at least 8 items
- Return ONLY valid JSON matching the format above, no other text
` : `
You are a Spanish language teacher helping intermediate (B1-B2) students understand a text.

Analyze this Spanish text and identify:
1. Key words and phrases that are essential for understanding the main points (especially anything specialised, technical, or otherwise unusual)
2. Idiomatic expressions and collocations
3. Advanced or uncommon vocabulary that intermediate learners might not know

Focus on itemsthat are core to the meaning of the text and that would be most valuable for a B1-B2 learner to add to their vocabulary.

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
- Include 10 items minimum
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

    console.log('Claude response:', response.content[0].text)
    
    try {
      const analysis = JSON.parse(response.content[0].text)
      return NextResponse.json(analysis)
    } catch (parseError) {
      console.error('Failed to parse Claude response:', response.content[0].text)
      return NextResponse.json(
        { error: 'Invalid response format from analysis service' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Text analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze text' },
      { status: 500 }
    )
  }
} 