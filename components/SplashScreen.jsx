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
            onLoadingComplete();
          }, 100); // 500ms delay so the user can see the completed progress bar
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <section className='flex flex-col justify-center items-center'>
      <h1 className="text-[30px]">Let's Make Progress, <br /> One Task at a Time!</h1>
      <p className='text-[16px] font-normal italic'>Track. Focus. Achieve</p>
    
      <div className="w-[175px] h-[6px] bg-gray-500 rounded-full overflow-hidden">
        <div
          className="h-2 bg-blue-400 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </section>
  );
};

export default SplashScreen;