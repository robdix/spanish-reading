import { AuthForm } from '@/components/AuthForm'

export default function LoginPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Sign In</h1>
      <AuthForm />
    </main>
  )
} 