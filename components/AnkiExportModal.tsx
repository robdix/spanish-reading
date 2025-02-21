'use client'

import { useState, useEffect } from 'react'

interface FieldMapping {
  fields: string[]
  separator: string
}

interface AnkiExportModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (fieldMappings: FieldMapping[], exportType: 'all' | 'new') => void
  newEntriesCount: number
  totalEntriesCount: number
}

const FIELD_OPTIONS = [
  { label: 'Empty', value: '' },
  { label: 'Word', value: 'word' },
  { label: 'Definition', value: 'definition' },
  { label: 'Example', value: 'example' },
  { label: 'Example Translation', value: 'example_translation' },
  { label: 'Infinitive', value: 'infinitive' },
  { label: 'Notes', value: 'notes' }
] as const

const SEPARATOR_OPTIONS = [
  { label: 'Line Break', value: '<br>' },
  { label: 'Paragraph Break', value: '<br><br>' },
  { label: 'Space', value: ' ' },
  { label: 'Comma', value: ', ' },
  { label: 'Dash', value: ' - ' },
] as const

export function AnkiExportModal({ isOpen, onClose, onExport, newEntriesCount, totalEntriesCount }: AnkiExportModalProps) {
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>(
    Array(6).fill({ fields: [''], separator: '<br>' })
  )
  const [exportType, setExportType] = useState<'all' | 'new'>('new')

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleExport = () => {
    onExport(fieldMappings, exportType)
    onClose()
  }

  const handleAddField = (ankiFieldIndex: number) => {
    setFieldMappings(current => {
      const newMappings = [...current]
      newMappings[ankiFieldIndex] = {
        ...newMappings[ankiFieldIndex],
        fields: [...newMappings[ankiFieldIndex].fields, '']
      }
      return newMappings
    })
  }

  const handleRemoveField = (ankiFieldIndex: number, fieldIndex: number) => {
    setFieldMappings(current => {
      const newMappings = [...current]
      newMappings[ankiFieldIndex] = {
        ...newMappings[ankiFieldIndex],
        fields: newMappings[ankiFieldIndex].fields.filter((_, i) => i !== fieldIndex)
      }
      return newMappings
    })
  }

  const handleFieldChange = (ankiFieldIndex: number, fieldIndex: number, value: string) => {
    setFieldMappings(current => {
      const newMappings = [...current]
      newMappings[ankiFieldIndex] = {
        ...newMappings[ankiFieldIndex],
        fields: newMappings[ankiFieldIndex].fields.map((f, i) => 
          i === fieldIndex ? value : f
        )
      }
      return newMappings
    })
  }

  const handleSeparatorChange = (ankiFieldIndex: number, separator: string) => {
    setFieldMappings(current => {
      const newMappings = [...current]
      newMappings[ankiFieldIndex] = {
        ...newMappings[ankiFieldIndex],
        separator
      }
      return newMappings
    })
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div 
          className="relative mx-auto max-w-xl w-full bg-white rounded-xl p-6"
          onClick={e => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold mb-4">
            Export to Anki
          </h2>

          <div className="space-y-4 mb-6 max-h-[70vh] overflow-y-auto pr-2">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="export-new"
                  name="export-type"
                  value="new"
                  checked={exportType === 'new'}
                  onChange={(e) => setExportType(e.target.value as 'all' | 'new')}
                  className="text-blue-600"
                />
                <label htmlFor="export-new" className="flex-1">
                  <span className="font-medium">New entries only</span>
                  <span className="text-sm text-gray-500 block">
                    {newEntriesCount} words not yet exported
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="export-all"
                  name="export-type"
                  value="all"
                  checked={exportType === 'all'}
                  onChange={(e) => setExportType(e.target.value as 'all' | 'new')}
                  className="text-blue-600"
                />
                <label htmlFor="export-all" className="flex-1">
                  <span className="font-medium">All entries</span>
                  <span className="text-sm text-gray-500 block">
                    {totalEntriesCount} words total
                  </span>
                </label>
              </div>
            </div>

            <p className="text-gray-600">
              Select which dictionary fields should go into each Anki field.
              The same field can be used multiple times.
            </p>

            <div className="space-y-6">
              {fieldMappings.map((mapping, ankiFieldIndex) => (
                <div key={ankiFieldIndex} className="space-y-2">
                  <label className="block font-medium">Anki Field {ankiFieldIndex + 1}:</label>
                  
                  <div className="space-y-2">
                    {mapping.fields.map((field, fieldIndex) => (
                      <div key={fieldIndex} className="flex items-center gap-2">
                        <select
                          value={field}
                          onChange={(e) => handleFieldChange(ankiFieldIndex, fieldIndex, e.target.value)}
                          className="form-select rounded-md border-gray-300 shadow-sm flex-1"
                        >
                          {FIELD_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        
                        {fieldIndex > 0 && (
                          <button
                            onClick={() => handleRemoveField(ankiFieldIndex, fieldIndex)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Remove field"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {mapping.fields.length > 1 && (
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Separator:</label>
                      <select
                        value={mapping.separator}
                        onChange={(e) => handleSeparatorChange(ankiFieldIndex, e.target.value)}
                        className="form-select rounded-md border-gray-300 shadow-sm text-sm"
                      >
                        {SEPARATOR_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    onClick={() => handleAddField(ankiFieldIndex)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add another field
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="btn-primary"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </>
  )
} 