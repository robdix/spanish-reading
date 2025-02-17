export const basePrompt = (difficulty: string, length: 'short' | 'medium' | 'long') => {
    const lengthGuides = {
        'short': {
            structure: '2-3 concise paragraphs',
            intro: '1 paragraph overview',
            conclusion: '1 paragraph summary',
            scope: 'Focus on essential information only'
        },
        'medium': {
            structure: '6-8 well-developed paragraphs',
            intro: '1-2 paragraphs',
            conclusion: '1 paragraph',
            scope: 'Cover main points with supporting details'
        },
        'long': {
            structure: '12-15 detailed paragraphs',
            intro: '2-3 paragraphs',
            conclusion: '2 paragraphs',
            scope: 'Comprehensive coverage with extensive details'
        }
    } as const
    
    const guide = lengthGuides[length]
    
    return `
Structural requirements:
- The content should be ${guide.structure}
- Structure should include:
  * Clear introduction (${guide.intro})
  * Well-developed main content
  * Satisfying conclusion (${guide.conclusion})
- Scope: ${guide.scope}
- Each sentence should be complete and natural

Format requirements:
- Return ONLY the content: no introduction, no conclusion, no comments, nothing
- Use appropriate vocabulary and grammar for ${difficulty} level
- Use proper Spanish punctuation and accents
- Format with clear paragraph breaks and proper spacing between paragraphs

Note: The length differences between short/medium/long should be very noticeable to readers.
`
} 