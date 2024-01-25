'use client'
import React, { Suspense } from 'react';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import MyUnits from './MyUnits';

initializeIcons();

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