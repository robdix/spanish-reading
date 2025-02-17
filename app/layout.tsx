import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Navigation } from "@/components/Navigation"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Spanish Learning App",
  description: "Learn Spanish with AI-powered stories and tools",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        {children}
      </body>
    </html>
  )
} 