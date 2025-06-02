"use client"
import React, { useState } from 'react'
import WelcomeScreen from '@/components/WelcomeScreen'
import SplashScreen from '@/components/SplashScreen'

const Page = () => {
  const [loadingComplete, setLoadingComplete] = useState(false);

  const handleLoadingComplete = () => {
    setLoadingComplete(true);
  };

  return (
    <div className=''>
      {!loadingComplete ? (
        <SplashScreen onLoadingComplete={handleLoadingComplete} />
      ) : (
        <WelcomeScreen />
      )}
    </div>
  )
}

export default Page