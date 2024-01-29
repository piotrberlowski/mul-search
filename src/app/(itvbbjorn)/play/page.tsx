'use client'
import { Suspense } from 'react';
import MyUnits from './MyUnits';

function CsrFallback() {
  return <>Preparing your army...</>
}

function App() {

  return (
    <div className="App">
      <Suspense fallback={<CsrFallback />}>
        <MyUnits />
      </Suspense>
    </div>
  );
}

export default App;