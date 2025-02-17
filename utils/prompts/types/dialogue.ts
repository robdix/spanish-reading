export const dialoguePrompt = (topic: string) => `
Create a natural dialogue in Spanish ${topic ? `about ${topic}` : 'between two or more people'}.

Style guidelines:
- Use conversational, everyday language
- Include common expressions and idioms
- Show clear turn-taking between speakers
- Include context and speaker emotions
- Focus on realistic situations and interactions
- Use appropriate informal/formal speech based on context
` 