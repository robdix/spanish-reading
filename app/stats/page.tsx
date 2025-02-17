'use client'

import { StatsOverview } from '@/components/StatsOverview'
import { ReadingCalendar } from '@/components/ReadingCalendar'
import { ReadingChart } from '@/components/ReadingChart'

export default function StatsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Reading Statistics</h1>
      <div className="space-y-8">
        <StatsOverview />
        <ReadingCalendar />
        <ReadingChart />
      </div>
    </main>
  )
} 