import { ArrowUpIcon } from '@heroicons/react/24/outline'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import ScrollToTop from '@/components/scrollToTop'

import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Alpha Strike Builder',
  description: 'A minimal search interface and List Builder backed by MasterUnitList.info',
}

function Header() {
  return (
    <div className='flex-0 flex flex-wrap min-h-12 border border-black border-black dark:border-white border-solid rounded-md items-center align-bottom print:hidden w-full'>
      <div className='w-full sm:text-xl md:text-2xl text-center'>
        <Link href="/">Alpha Strike ({publicRuntimeConfig?.version})</Link> powered by <Link href="http://masterunitlist.info" target="_blank">Master Unit List API</Link>
      </div>
    </div>
  )
}

function FloatingFooter() {
  return (
    <div className='sticky bottom-0 mt-2 items-justified text-center bg-inherit border-t border-t-solid border-t-1 border-t-black dark:border-t-white text-xs print:hidden'>
      <div className='w-full items-right relative'>
        <ScrollToTop className="absolute -top-8" />
      </div>
      <div className='grid grid-cols-3 w-full'>
        <span>Data and search API courtesy of <a href="http://www.masterunitlist.info">Master Unit List.</a></span>
        <span>Import for play in <a href="https://jdgwf.github.io/battletech-tools/alpha-strike/roster">Jeff&apos;s Battletech Tools</a></span>
        <span>App source available at <a href="https://github.com/piotrberlowski/mul-search">GitHub</a>.</span>
      </div>
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <div className='max-w-screen-lg mx-auto items-center bg-inherit translate-y-0 flex flex-col h-screen'>
          <Header />
          {children}
          <FloatingFooter />
        </div>
      </body>
    </html>
  )
}
