import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MUL Search',
  description: 'A minimal app to search MasterUnitList for AlphaStrike units',
}

function Header() {
  return (
    <div className='flex flex-row h-12 min-h-full border border-black border-black dark:border-white border-solid rounded-md items-center align-bottom'>
      <span className='basis-full inline-block text-2xl text-center'>
        List Builder for Alpha Strike
      </span>
    </div>
  )
}

function FloatingFooter() {
  return (
    <div className='grid grid-cols-2 sticky bottom-0 mt-2 items-justified text-center bg-inherit border-t border-t-solid border-t-1 border-t-black dark:border-t-white text-xs'>
        <span>Data and search API courtesy of <a href="http://www.masterunitlist.info">Master Unit List.</a>.</span>
        <span>App source available at <a href="https://github.com/piotrberlowski/mul-search">GitHub</a>.</span> 
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
      <body className={inter.className}>
        <div className='max-w-screen-lg mx-auto items-center bg-inherit translate-y-0'>
          <Header/>
          {children}
          <FloatingFooter/>
        </div>
      </body>
    </html>
  )
}
