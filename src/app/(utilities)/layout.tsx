import '../globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import FloatingFooter from '@/components/floatingFooter'
import Navigation from '@/components/navbar'
import {SessionProvider} from "next-auth/react"

const inter = Inter({ subsets: ['latin'] })
const scrollableId = "main-body"

export const metadata: Metadata = {
  title: 'Alpha Strike Builder',
  description: 'A minimal search interface and List Builder backed by MasterUnitList.info',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <html lang="en">
      <body id={scrollableId} className={`${inter.className} h-dvh w-full flex flex-col px-2 relative`}>
        <div className='flex-0 flex'>
          <Navigation className="flex-1"/>
        </div>
          {children}
        <FloatingFooter scrollTarget={scrollableId} />
      </body>
    </html>
  )
}

