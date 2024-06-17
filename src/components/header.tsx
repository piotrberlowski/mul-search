import Link from 'next/link'
import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();


export default function Header({className}:{className?:string}) {
    return (
      <div className={`h-8 z-10 flex flex-wrap min-h-12 border border-black border-black dark:border-white border-solid rounded-md items-center align-bottom print:hidden ${className}`}>
        <div className='w-full text-sm md:text-xl text-center'>
          <Link href="/">List Builder for AS ({publicRuntimeConfig?.version})</Link> powered by <Link href="http://masterunitlist.info" target="_blank">Master Unit List API</Link>
        </div>
      </div>
    )
  }
  