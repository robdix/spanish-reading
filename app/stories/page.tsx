'use client'

import StoryGeneratorForm from '@/components/StoryGeneratorForm'
import { StatsOverview } from '@/components/StatsOverview'
import { supabase } from '@/utils/supabase'
import { useEffect } from 'react'

export default function StoriesPage() {
  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase.from('stories').select('count')
        if (error) throw error
        console.log('Successfully connected to Supabase!')
      } catch (error) {
        console.error('Supabase connection test:', error)
      }
    }
    
    testConnection()
  }, [])

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Story Generator</h1>
      <div className="mb-8">
        <StatsOverview className="mb-8" />
      </div>
      <StoryGeneratorForm />
    </main>
  )
} 