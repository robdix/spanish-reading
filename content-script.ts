function extractPageContent() {
  // Common selectors for news sites
  const selectors = {
    headline: [
      'h1',
      '[data-testid="headline"]',
      '.article-headline',
      '.story-heading'
    ],
    content: [
      'article',
      '[data-testid="article-body"]',
      '.article-content',
      '.story-body'
    ]
  }

  // Try each selector until we find content
  const headline = selectors.headline
    .map(selector => document.querySelector(selector))
    .find(el => el)?.textContent?.trim()

  const content = selectors.content
    .map(selector => document.querySelector(selector))
    .find(el => el)?.textContent?.trim()

  return { headline, content }
} 