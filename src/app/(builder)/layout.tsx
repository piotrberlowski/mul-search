import { ArrowUpIcon, ListBulletIcon } from '@heroicons/react/24/outline'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import ScrollToTop from '@/components/scrollToTop'

import getConfig from 'next/config';
import { LIST_DRAWER_ID } from './builder/constants'

const { publicRuntimeConfig } = getConfig();

const inter = Inter({ subsets: ['latin'] })
const scrollableId = "scroll-body"

export const metadata: Metadata = {
  title: 'Alpha Strike Builder',
  description: 'A minimal search interface and List Builder backed by MasterUnitList.info',
}

function Header() {

  return (
    <div className='fixed h-8 z-10 max-xl:inset-x-2 xl:w-1/2 flex flex-wrap min-h-12 border border-black border-black dark:border-white border-solid rounded-md items-center align-bottom print:hidden'>
      <div className='w-full text-sm md:text-xl text-center'>
        <Link href="/">List Builder for AS ({publicRuntimeConfig?.version})</Link> powered by <Link href="http://masterunitlist.info" target="_blank">Master Unit List API</Link>
      </div>
    </div>
  )
}

function FloatingFooter() {
  return (
    <div className='fixed bottom-0 mt-2 items-justified text-center bg-inherit border-t border-t-solid border-t-1 border-t-black dark:border-t-white text-xs print:hidden w-full'>
      <div className='w-full items-right relative'>
        <ScrollToTop className="absolute -top-8 pointer-events-none" target={scrollableId}>
          <label htmlFor={LIST_DRAWER_ID} className='btn btn-circle btn-outline bg-base-200 btn-xs flex-0 xl:hidden'><ListBulletIcon className='h-4 w-4' /></label>
        </ScrollToTop>
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
      <body className={`${inter.className} h-screen`}>
        <div id={scrollableId} className='flex-1 h-full mx-[1%] items-center bg-inherit translate-y-0 overflow-scroll max-xl:px-2'>
          <Header />
          {children}
        </div>
        <FloatingFooter/>
      </body>
    </html>
  )
}
