export const newsPrompt = (topic: string) => `
Create a news article in Spanish ${topic ? `about ${topic}` : 'about a current event or interesting topic'}.

Style guidelines:
- Use a journalistic, informative tone
- Include a clear headline
- Follow inverted pyramid structure (most important info first)
- Use quotes and attributions where appropriate
- Include relevant details (who, what, when, where, why)
- Keep sentences clear and direct
` 