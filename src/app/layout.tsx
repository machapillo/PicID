import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import VersionBadge from '@/components/VersionBadge'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pashatto Print - 証明写真アプリ',
  description: '自宅で簡単に証明写真を作成できるアプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {children}
        <VersionBadge />
      </body>
    </html>
  )
}
