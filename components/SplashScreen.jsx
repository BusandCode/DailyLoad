"use client"
import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        // When we reach 100%, call the onLoadingComplete callback
        const newProgress = prev < 100 ? prev + 1 : 100;
        if (newProgress === 100) {
          clearInterval(interval);
          // Add a small delay before transitioning to the welcome screen
          setTimeout(() => {
            onLoadingComplete && onLoadingComplete();
          }, 100); // 100ms delay so the user can see the completed progress bar
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <section className='min-h-screen text-white flex items-center justify-center'>
      <div className='flex flex-col items-center justify-center gap-6 px-4'>
        <div className='text-center space-y-2'>
          <h1 className="text-[30px] md:text-[36px] font-bold leading-tight">
            Let's Make Progress, One Task at a Time!
          </h1>
          <p className='text-[16px] md:text-[18px] font-normal italic opacity-90'>
            Track. Focus. Achieve
          </p>
        </div>
        
        <div className="w-[175px] md:w-[200px] h-[6px] bg-gray-700 bg-opacity-50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-purple-600 transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className='text-sm opacity-75'>{progress}%</p>
      </div>
    </section>
  );
};

export default SplashScreen;