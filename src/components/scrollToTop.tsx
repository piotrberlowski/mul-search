'use client'
import { ArrowUpIcon } from "@heroicons/react/24/outline";

const isBrowser = () => typeof window !== 'undefined';

function scrollToTop() {
  if (!isBrowser()) return;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


export default function ScrollToTop({className}:{className: string}) {
    return (
        <button className={`btn btn-circle btn-outline bg-base-200 btn-xs ${className}`} onClick={() => scrollToTop()}><ArrowUpIcon className='w-4 h-4' /></button>
    )
}