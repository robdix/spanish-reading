'use client'

import { useState, useEffect } from 'react'

interface AnkiExportModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (fieldMappings: string[], exportType: 'all' | 'new') => void
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

export function AnkiExportModal({ isOpen, onClose, onExport, newEntriesCount, totalEntriesCount }: AnkiExportModalProps) {
  const [fieldMappings, setFieldMappings] = useState<string[]>(Array(6).fill(''))
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

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div 
          className="relative mx-auto max-w-xl bg-white rounded-xl p-6"
          onClick={e => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold mb-4">
            Export to Anki
          </h2>

          <div className="space-y-4 mb-6">
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

            {fieldMappings.map((mapping, index) => (
              <div key={index} className="flex items-center gap-4">
                <label className="w-24">Field {index + 1}:</label>
                <select
                  value={mapping}
                  onChange={(e) => {
                    const newMappings = [...fieldMappings]
                    newMappings[index] = e.target.value
                    setFieldMappings(newMappings)
                  }}
                  className="form-select rounded-md border-gray-300 shadow-sm flex-1"
                >
                  {FIELD_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
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