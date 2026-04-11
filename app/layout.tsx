import type { Metadata } from 'next'
import { Inter, Newsreader } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600']
})

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  style: ['normal', 'italic'],
  weight: ['400', '500']
})

export const metadata: Metadata = {
  title: 'Problem Radar - Analytical Archive',
  description: 'A minimalist repository of systemic risks, emerging phenomena, and critical industrial challenges.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${newsreader.variable} bg-surface font-body text-on-surface min-h-screen flex flex-col selection:bg-primary/10`}>
        {children}
      </body>
    </html>
  )
}
