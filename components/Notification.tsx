'use client'

interface NotificationProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export function Notification({ message, type, onClose }: NotificationProps) {
  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
      type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
    }`}>
      <div className="flex items-center gap-2">
        {type === 'success' ? (
          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
        <p className={type === 'success' ? 'text-green-700' : 'text-red-700'}>
          {message}
        </p>
        <button
          onClick={onClose}
          className={`ml-4 ${
            type === 'success' ? 'text-green-400 hover:text-green-500' : 'text-red-400 hover:text-red-500'
          }`}
        >
          ×
        </button>
      </div>
    </div>
  )
} 