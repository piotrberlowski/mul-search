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
        <a className='mx-auto text-red-600 hover:text-red-300 visited:text-red-700' href="http://www.masterunitlist.info">MasterUnitList</a> Search for Alpha Strike
      </span>
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
        <div className='max-w-screen-lg mx-auto items-center bg-inherit'>
          <Header/>
          {children}
        </div>
      </body>
    </html>
  )
}
