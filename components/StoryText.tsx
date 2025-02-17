'use client'
import { useState } from 'react'

interface Word {
  text: string
  isWord: boolean  // false for punctuation/whitespace
}

interface StoryTextProps {
  content: string
  onWordSelect: (word: string) => void
  selectedWord?: string | null
}

export function StoryText({ content, onWordSelect, selectedWord }: StoryTextProps) {
  const [selectionStart, setSelectionStart] = useState<number | null>(null)
  const [currentDragEnd, setCurrentDragEnd] = useState<number | null>(null)

  // Helper function to check if a word is part of the currently selected phrase
  const isWordSelected = (word: string, index: number, content: string) => {
    if (!selectedWord || !content) return false
    
    // For single words, do a direct comparison
    if (!selectedWord.includes(' ') && word === selectedWord) {
      return true
    }
    
    // Get the position where this word appears in the content
    const contentUpToIndex = words
      .slice(0, index + 1)
      .map(w => w.text)
      .join('')
    
    const wordPosition = contentUpToIndex.length - word.length
    
    // For phrases, check if this word's position is within the selected phrase
    const phrasePosition = content.indexOf(selectedWord)
    if (phrasePosition === -1) return false
    
    const wordStart = wordPosition
    const wordEnd = wordPosition + word.length
    const phraseEnd = phrasePosition + selectedWord.length
    
    // Check if the word's position overlaps with the phrase position
    return wordStart >= phrasePosition && wordEnd <= phraseEnd
  }

  const handleMouseDown = (index: number) => {
    setSelectionStart(index)
    setCurrentDragEnd(index)
  }

  const handleMouseUp = (index: number) => {
    if (selectionStart === null) return

    const start = Math.min(selectionStart, index)
    const end = Math.max(selectionStart, index)
    
    // Get all words between start and end indices
    const selectedWords = words
      .slice(start, end + 1)
      .filter(w => w.isWord)
      .map(w => w.text)
      .join(' ')
    
    if (selectedWords) {
      onWordSelect(selectedWords)
    }
    
    setSelectionStart(null)
    setCurrentDragEnd(null)
  }

  const handleMouseMove = (index: number) => {
    if (selectionStart !== null) {
      setCurrentDragEnd(index)
    }
  }

  // Get the current selection range for highlighting
  const getSelectionRange = () => {
    if (selectionStart === null || currentDragEnd === null) return null
    return {
      start: Math.min(selectionStart, currentDragEnd),
      end: Math.max(selectionStart, currentDragEnd)
    }
  }

  const selectionRange = getSelectionRange()

  // Split into words while preserving punctuation and spacing
  const words: Word[] = content.split(/(\s+|[.,!?;])/g).map(text => ({
    text,
    isWord: /^[A-Za-zÀ-ÿ]+$/.test(text)  // Spanish character range
  }));

  return (
    <div className="story-container">
      {words.map((word, index) => (
        word.isWord ? (
          <span
            key={index}
            className={`cursor-pointer transition-colors
              ${selectionStart !== null ? 'select-none' : ''}
              ${selectionRange && 
                index >= selectionRange.start && 
                index <= selectionRange.end
                  ? 'bg-yellow-100' : ''}
              ${isWordSelected(word.text, index, content) ? 'bg-yellow-200' : 'hover:bg-yellow-100'}
            `}
            onMouseDown={() => handleMouseDown(index)}
            onMouseUp={() => handleMouseUp(index)}
            onMouseEnter={() => handleMouseMove(index)}
          >
            {word.text}
          </span>
        ) : (
          <span key={index}>{word.text}</span>
        )
      ))}
    </div>
  );
} 