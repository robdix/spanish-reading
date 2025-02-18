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
1. Key vocabulary used in the translation that matches the specified level
2. Idiomatic expressions and natural Spanish constructions
3. Grammar patterns that might be new or challenging
4. Cultural adaptations made in the translation

Focus on items that demonstrate how Spanish expresses these ideas naturally.

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
- Include 5-8 items that best represent natural Spanish expression
- Focus on phrases that show how Spanish differs from English
- Provide the specific context from the translation
- Explain any cultural or usage nuances in the notes
- Return ONLY valid JSON matching the format above, no other text
` : `
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
- Include 10 items minimum
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