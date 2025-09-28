import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rotating Globe - Three.js',
  description: 'A stunning 3D rotating Earth visualization built with Three.js and Next.js',
  keywords: ['three.js', 'webgl', '3d', 'earth', 'globe', 'visualization'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}