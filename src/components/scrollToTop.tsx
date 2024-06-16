'use client'
import { ArrowUpIcon } from "@heroicons/react/24/outline";
import React from "react";

const isBrowser = () => typeof window !== 'undefined';

function scrollToTop(target: string) {
  if (!isBrowser()) return;
  document.getElementById(target)?.scrollTo({ top: 0, behavior: 'smooth' });
}


export default function ScrollToTop({target, className, children}:{target: string, className: string, children?: React.ReactNode}) {
    return (
        <div className={`items-center w-full ${className}`}>
          <button className={`btn btn-circle btn-outline bg-base-200 btn-xs pointer-events-auto`} onClick={() => scrollToTop(target)}><ArrowUpIcon className='w-4 h-4' /></button>
          {children}
        </div>
    )
}