import ScrollToTop from "./scrollToTop";

export default function FloatingFooter({scrollTarget, children}:{scrollTarget?:string, children?: React.ReactNode}) {
    return (
      <div className='fixed bottom-0 items-justified text-center bg-white dark:bg-black border-t border-t-solid border-t-1 border-t-black dark:border-t-white text-xs print:hidden w-full h-4 z-30'>
        <div className='w-full items-right'>
          <ScrollToTop className="absolute -top-8 pointer-events-none" target={scrollTarget}>
            {children}
          </ScrollToTop>
        </div>
        <div className='grid grid-cols-2 w-full'>
          <span>Data: <a href="https://masterunitlist.battletech.com">Master Unit List.</a></span>
          <span>Source: <a href="https://github.com/piotrberlowski/mul-search">GitHub</a>.</span>
        </div>
      </div>
    )
  }