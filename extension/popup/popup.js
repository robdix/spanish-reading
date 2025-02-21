// Simplified version without TypeScript/React
document.addEventListener('DOMContentLoaded', () => {
  const levelSelect = document.querySelector('#level-select')
  const translateButton = document.querySelector('#translate-button')
  const previewDiv = document.querySelector('#preview')
  const errorDiv = document.querySelector('#error')

  // Extract content when popup opens
  chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
    if (!tab.id) return
    
    try {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Helper to get text content without hidden elements
          const getCleanText = (element) => {
            // Clone the element to avoid modifying the page
            const clone = element.cloneNode(true)
            
            // Remove common noise elements
            const selectorsToRemove = [
              '.related-stories',
              '.social-share',
              '.advertisement',
              '.newsletter-signup',
              'nav',
              'footer',
              '.footer',
              '.comments',
              '.recommendations',
              '[data-testid="related-content"]',
              '[data-testid="share-tools"]',
              'script',
              'style'
            ]
            
            selectorsToRemove.forEach(selector => {
              clone.querySelectorAll(selector).forEach(el => el.remove())
            })
            
            // Get text and clean it
            return clone.textContent
              .trim()
              .replace(/\s+/g, ' ') // Normalize whitespace
              .replace(/\n+/g, '\n') // Normalize line breaks
          }

          // Try simpler selectors first
          const simpleSelectors = {
            headline: ['h1'],
            content: ['article', 'main', '.article-body', '.story-body']
          }

          let headline = ''
          let content = ''

          // Try simple headline selectors
          for (const selector of simpleSelectors.headline) {
            const el = document.querySelector(selector)
            if (el) {
              headline = el.textContent?.trim() || ''
              break
            }
          }

          // Try simple content selectors
          for (const selector of simpleSelectors.content) {
            const el = document.querySelector(selector)
            if (el) {
              content = getCleanText(el)
              if (content.length > 100) { // Basic validation
                break
              }
            }
          }

          // If simple selectors fail, try more specific ones
          if (!content || content.length < 100) {
            const articleSelectors = [
              'article[class*="article"]',
              'article[class*="story"]',
              'article[class*="post"]',
              '[data-testid="article-body"]',
              '.article-content',
              '.story-body',
              '.bbc-article', 
              '.guardian-article'
            ]

            for (const selector of articleSelectors) {
              const el = document.querySelector(selector)
              if (el) {
                content = getCleanText(el)
                if (content.length > 100) {
                  break
                }
              }
            }
          }

          // Debug output to console
          console.log('Extracted headline:', headline)
          console.log('Extracted content length:', content.length)

          return { 
            headline: headline || 'No headline found',
            content: content || 'No content found'
          }
        }
      })

      console.log('Extraction result:', result) // Debug output

      if (result.content.length > 100) { // Basic validation
        // Create an editable preview
        previewDiv.innerHTML = `
          <div class="headline-section">
            <label class="block text-sm font-medium mb-1">Headline:</label>
            <textarea class="headline w-full p-2 border rounded">${result.headline}</textarea>
          </div>
          <div class="content-section mt-4">
            <label class="block text-sm font-medium mb-1">Content:</label>
            <textarea class="content w-full h-40 p-2 border rounded">${result.content}</textarea>
          </div>
        `

        translateButton.onclick = () => {
          const editedHeadline = previewDiv.querySelector('textarea.headline')?.value || ''
          const editedContent = previewDiv.querySelector('textarea.content')?.value || ''
          
          console.log('Sending to translate:', {
            headline: editedHeadline,
            content: editedContent
          })

          const params = new URLSearchParams({
            text: editedHeadline && editedContent 
              ? `${editedHeadline}\n\n${editedContent}`
              : editedContent || editedHeadline, // fallback to whichever has content
            level: levelSelect.value,
            source: 'extension'
          })

          const url = `http://localhost:3000/translate?${params.toString()}`
          window.open(url, '_blank')
        }
        translateButton.disabled = false
      } else {
        errorDiv.textContent = 'No article content found on this page'
        translateButton.disabled = true
      }
    } catch (error) {
      errorDiv.textContent = 'Failed to extract content'
      console.error('Extraction error:', error)
    }
  })
}) 