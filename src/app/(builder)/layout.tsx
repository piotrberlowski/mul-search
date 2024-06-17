import { ListBulletIcon } from '@heroicons/react/24/outline'
import '../globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { LIST_DRAWER_ID } from './builder/constants'
import Header from '@/components/header'
import FloatingFooter from '@/components/floatingFooter'


const inter = Inter({ subsets: ['latin'] })
const scrollableId = "scroll-body"

export const metadata: Metadata = {
  title: 'Alpha Strike Builder',
  description: 'A minimal search interface and List Builder backed by MasterUnitList.info',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body id={scrollableId} className={`${inter.className} h-screen`}>
        <div className='flex-1 h-full mx-[1%] items-center bg-inherit translate-y-0 max-xl:px-2'>
          <Header className='fixed max-xl:inset-x-2 xl:w-1/2'/>
          {children}
        </div>
        <FloatingFooter>
          <label htmlFor={LIST_DRAWER_ID} className='btn btn-circle btn-outline bg-base-200 btn-xs flex-0 xl:hidden pointer-events-auto'><ListBulletIcon className='h-4 w-4' /></label>
        </FloatingFooter>
      </body>
    </html>
  )
}
