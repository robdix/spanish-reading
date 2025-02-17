import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold text-center mb-12">
        Learn Spanish with AI
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <FeatureCard 
          title="Reading Tracker"
          description="Track your reading progress and maintain your daily streak"
          href="/tracker"
        />
        <FeatureCard 
          title="Story Generator"
          description="Generate personalized Spanish stories with AI"
          href="/stories"
        />
        <FeatureCard 
          title="Transcript Upload"
          description="Upload transcripts and discover new vocabulary"
          href="/transcripts"
        />
      </div>
    </main>
  )
}

function FeatureCard({ 
  title, 
  description, 
  href 
}: { 
  title: string
  description: string
  href: string 
}) {
  return (
    <Link href={href}>
      <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
        <h2 className="text-2xl font-semibold mb-3">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  )
} 