// Simplified version without TypeScript/React
document.addEventListener('DOMContentLoaded', () => {
  const levelSelect = document.querySelector('#level-select')
  const translateButton = document.querySelector('#translate-button')
  const previewDiv = document.querySelector('#preview')
  const errorDiv = document.querySelector('#error')
  const wordCountDiv = document.querySelector('#word-count')

  // Function to count words in text
  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  // Function to update word count
  const updateWordCount = () => {
    const headlineText = previewDiv.querySelector('#headline')?.value || ''
    const contentText = previewDiv.querySelector('#content')?.value || ''
    const totalWords = countWords(headlineText) + countWords(contentText)
    wordCountDiv.textContent = `${totalWords} words`
  }

  // Extract content when popup opens
  chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
    if (!tab.id) return
    
    try {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Check if this is a Wikipedia page
          const isWikipedia = window.location.hostname.includes('wikipedia.org')
          console.log('Is Wikipedia page:', isWikipedia)

          // Check for selected text first
          const selection = window.getSelection()
          if (selection && selection.toString().trim()) {
            return {
              headline: 'Selected Text',
              content: selection.toString().trim(),
              isWikipedia: false // Don't apply Wikipedia-specific processing to selection
            }
          }

          // If no selection, proceed with normal extraction
          // Helper to get text content without hidden elements
          const getCleanText = (element) => {
            if (!element) return ''
            
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
            
            // Wikipedia-specific elements to remove
            if (isWikipedia) {
              selectorsToRemove.push(
                '.mw-editsection',          // Edit section links
                '.reference',               // Reference numbers
                '.mw-references-wrap',      // References section
                '.navbox',                  // Navigation boxes
                '.infobox',                // Information boxes
                '#mw-navigation',          // Navigation
                '#mw-panel',               // Left sidebar
                '#mw-head',                // Top bar
                '.thumb',                  // Images
                '.mbox-small',             // Notice boxes
                '#coordinates',            // Coordinates
                '.hatnote',               // Disambiguation notices
                '.portal',                // Portal links
                '.mw-jump-link',          // Accessibility links
                '.mw-indicators',         // Page indicators
                '.authority-control',     // Authority control
                '#authority-control',     // Authority control
                '.ext-discussiontools-init-section',  // Discussion tools
                '.mw-authority-control',  // Authority control
                '#footer',                // Footer
                '#footer-info',           // Footer info
                '#catlinks',              // Category links
                '.catlinks',              // Category links
                '.mw-normal-catlinks',    // Normal category links
                '.printfooter',           // Print footer
                '[class*="footer"]',      // Any element with footer in class
                '[id*="footer"]'         // Any element with footer in id
              )
            }
            
            selectorsToRemove.forEach(selector => {
              clone.querySelectorAll(selector).forEach(el => el.remove())
            })
            
            // Get text and clean it
            return clone.textContent
              .trim()
              .replace(/\s+/g, ' ') // Normalize whitespace
              .replace(/\n+/g, '\n') // Normalize line breaks
          }

          if (isWikipedia) {
            // Wikipedia-specific extraction
            const headline = document.querySelector('#firstHeading')?.textContent?.trim() || ''
            
            // Get the main content area but exclude certain sections
            const content = document.querySelector('#mw-content-text')
            let mainContent = ''
            
            if (content) {
              // Remove unwanted sections before getting content
              const contentClone = content.cloneNode(true)
              
              // Remove references, see also, notes, etc.
              const unwantedSections = [
                '#References',
                '#Referencias',
                '#Références', 
                '#Referenzen',
                '#Referências',
                '#See_also',
                '#Notes',
                '#Further_reading',
                '#External_links',
                '#Bibliography',
                '#Enlaces_externos',
                '#Notas',
                '#Bibliografía',
                '#Ver_también',
                '#Catálogo_de_obras',
                '#Datos',
                '#Enlaces_externos',
                '#Multimedia'
              ]

              // Helper function to remove element and everything after it
              const removeElementAndAfter = (element) => {
                if (!element) return
                let current = element
                while (current) {
                  const next = current.nextElementSibling
                  current.remove()
                  current = next
                }
              }
              
              // First try to find sections by ID
              unwantedSections.forEach(sectionId => {
                const section = contentClone.querySelector(`[id="${sectionId.replace('#', '')}"]`)
                if (section) {
                  const heading = section.closest('h1, h2, h3') || section
                  removeElementAndAfter(heading)
                }
              })

              // Also try to find sections by heading text
              const headings = contentClone.querySelectorAll('h1, h2, h3, h4')
              headings.forEach(heading => {
                const headingText = heading.textContent.trim().toLowerCase()
                if (
                  unwantedSections.some(section => 
                    headingText === section.replace('#', '').toLowerCase() ||
                    headingText.includes('referencias') ||
                    headingText.includes('references') ||
                    headingText.includes('notas') ||
                    headingText.includes('notes') ||
                    headingText.includes('enlaces') ||
                    headingText.includes('links') ||
                    headingText.includes('bibliograf') ||
                    headingText.includes('catalog') ||
                    headingText.includes('datos') ||
                    headingText.includes('multimedia')
                  )
                ) {
                  removeElementAndAfter(heading)
                }
              })

              // Remove citation references and their content
              contentClone.querySelectorAll('.reference, .references, .reflist, .refbegin, .mw-references-wrap').forEach(el => el.remove())
              
              // Remove ALL tables and their containers
              contentClone.querySelectorAll('table, .wikitable, .sortable, .infobox, .sidebar, [class*="table"]').forEach(el => {
                // Also remove the parent if it's just a container for the table
                if (el.parentElement?.children.length === 1) {
                  el.parentElement.remove()
                } else {
                  el.remove()
                }
              })
              
              // Remove citation numbers and arrows
              mainContent = getCleanText(contentClone)
                .replace(/\[\d+\]/g, '') // Remove citation numbers like [1], [2], etc
                .replace(/↑/g, '')      // Remove up arrows
                .replace(/\[cita requerida\]/g, '') // Remove [citation needed]
                .replace(/Datos: Q\d+/g, '') // Remove Wikidata IDs
                .replace(/Multimedia: [^/]+\/Q\d+/g, '') // Remove multimedia references
                .replace(/Obtenido de «[^»]+»/g, '') // Remove "obtained from" text
                .replace(/Sitio web oficial[^)]*\)/g, '') // Remove official website text
                .replace(/<img[^>]+>/g, '') // Remove any remaining img tags
                .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
                .replace(/\s+/g, ' ')   // Normalize whitespace
                .trim()
            }

            return {
              headline,
              content: mainContent,
              isWikipedia: true
            }
          }

          // Non-Wikipedia extraction (existing code)
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

          return { 
            headline: headline || 'No headline found',
            content: content || 'No content found',
            isWikipedia: false
          }
        }
      })

      console.log('Extraction result:', result) // Debug output

      if (result.content.length > 100) { // Basic validation
        // Create an editable preview with better structure
        previewDiv.innerHTML = `
          <div class="preview-section">
            <label for="headline">Headline</label>
            <textarea id="headline" class="headline-textarea">${result.headline}</textarea>
          </div>
          <div class="preview-section">
            <label for="content">Content</label>
            <textarea id="content" class="content-textarea">${result.content}</textarea>
          </div>
        `

        // Add input listeners for word count updates
        previewDiv.querySelector('#headline').addEventListener('input', updateWordCount)
        previewDiv.querySelector('#content').addEventListener('input', updateWordCount)

        // Initial word count
        updateWordCount()

        // Enable both buttons
        const logReadingButton = document.getElementById('log-reading-button')
        const translateButton = document.getElementById('translate-button')
        logReadingButton.disabled = false
        translateButton.disabled = false

        // Add click handler for log reading
        logReadingButton.onclick = async () => {
          const headlineText = previewDiv.querySelector('#headline')?.value || ''
          const contentText = previewDiv.querySelector('#content')?.value || ''
          const totalWords = countWords(headlineText) + countWords(contentText)
          
          console.log('Attempting to log reading with:', {
            wordCount: totalWords,
            date: new Date().toISOString().split('T')[0]
          })
          
          // Disable both buttons and show loading state
          logReadingButton.disabled = true
          translateButton.disabled = true
          logReadingButton.classList.add('loading')
          
          // Hide any existing messages
          document.getElementById('error').classList.remove('visible')
          document.getElementById('success').classList.remove('visible')
          
          try {
            const response = await fetch('http://localhost:3000/api/log-reading', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                wordCount: totalWords,
                date: new Date().toISOString().split('T')[0]
              })
            })
            
            console.log('Log reading response:', {
              status: response.status,
              statusText: response.statusText
            })
            
            if (!response.ok) {
              const errorData = await response.text()
              console.error('Server error response:', errorData)
              throw new Error(`Failed to log reading: ${response.status} ${response.statusText}${errorData ? ` - ${errorData}` : ''}`)
            }

            // Show success message
            const successDiv = document.getElementById('success')
            successDiv.textContent = 'Reading logged successfully!'
            successDiv.classList.add('visible')
            
            // Disable log reading button but keep translate enabled
            logReadingButton.textContent = 'Logged ✓'
            logReadingButton.disabled = true
            translateButton.disabled = false
            
          } catch (error) {
            console.error('Error logging reading:', error)
            const errorDiv = document.getElementById('error')
            errorDiv.textContent = error.message
            errorDiv.classList.add('visible')
            
            // Re-enable both buttons
            logReadingButton.disabled = false
            translateButton.disabled = false
          } finally {
            // Remove loading state
            logReadingButton.classList.remove('loading')
          }
        }
        
        // Update translate button handler
        translateButton.onclick = () => {
          const editedHeadline = previewDiv.querySelector('#headline')?.value || ''
          const editedContent = previewDiv.querySelector('#content')?.value || ''
          
          console.log('Sending to translate:', {
            headline: editedHeadline,
            content: editedContent
          })

          const params = new URLSearchParams({
            text: editedHeadline && editedContent 
              ? `${editedHeadline}\n\n${editedContent}`
              : editedContent || editedHeadline,
            level: levelSelect.value,
            source: 'extension'
          })

          const url = `http://localhost:3000/translate?${params.toString()}`
          window.open(url, '_blank')
        }
      } else {
        errorDiv.textContent = 'No article content found on this page'
        errorDiv.classList.add('visible')
        document.getElementById('log-reading-button').disabled = true
        document.getElementById('translate-button').disabled = true
      }
    } catch (error) {
      errorDiv.textContent = 'Failed to extract content'
      console.error('Extraction error:', error)
    }
  })

  // Add to existing DOMContentLoaded listener
  document.addEventListener('keydown', (e) => {
    // Alt+D for definition lookup
    if (e.altKey && e.key === 'd') {
      chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
        if (!tab.id) return;
        
        const [{ result }] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const selection = window.getSelection();
            if (!selection.toString()) return null;
            
            // Get context like in background.js
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            const fullText = container.textContent;
            const start = Math.max(0, range.startOffset - 100);
            const end = Math.min(fullText.length, range.endOffset + 100);
            
            return {
              word: selection.toString(),
              context: fullText.substring(start, end)
            };
          }
        });

        if (result) {
          // Create URL parameters
          const params = new URLSearchParams({
            word: result.word,
            context: result.context,
            source: 'extension'
          });

          // Open in a new Chrome window
          chrome.windows.create({
            url: `http://localhost:3000/define?${params.toString()}`,
            type: 'popup',
            width: 500,
            height: 800
          });
        }
      });
    }
  });

  // Add settings link handler
  document.getElementById('settings-link').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}) 