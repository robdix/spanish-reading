export const wikipediaPrompt = (topic: string) => `
Style guidelines:
- Use a neutral, encyclopedic tone
- Include factual information and details
- Structure with clear sections
- Use topic-appropriate terminology
- Maintain an objective viewpoint
${topic ? `- Focus the article on: ${topic}` : ''}
` 