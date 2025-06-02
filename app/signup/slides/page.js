"use client"
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation'
// Progress Bar Component
const ProgressBar = ({ currentStep, totalSteps }) => {
    
  return (
    <div className="w-full flex justify-between space-x-4">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="h-2 bg-gray-200 rounded-full flex-1">
          {index < currentStep && (
            <div className="h-full w-full bg-[#2d1b69] rounded-full transition-all duration-300 ease-in-out"></div>
          )}
        </div>
      ))}
    </div>
  );
};

// Step 1: Track Your Tasks
const TrackPeriodStep = ({ onNext }) => {
  return (
    <div className='min-h-screen h-full p-5 lg:w-3/5 lg:mx-auto'>
      <div className="w-full mb-8">
        <ProgressBar currentStep={1} totalSteps={1} />
      </div>
      
      <div className="flex justify-center mt-[100px] flex-col gap-[40px] items-center">
            <div className='flex flex-col justify-center items-center'>
         <Image src="/track-1.png" alt='track your period image' width={87} height={187} ></Image>
        <h2 className="text-[20px] font-bold text-white text-center">Track Your Tasks</h2>
        <p className="text-[13px] font-normal mt-2 text-center text-white">
          Log your tasks, priorities, and progress for personalized productivity insights.
        </p>
      </div>
      
      <button 
        onClick={onNext}
        className="absolute bottom-[35px]
        text-[15px] font-normal w-[337px] h-[48px]
        py-2 rounded-[5px] p-[10px] flex justify-center items-center
       transition ease-in cursor-pointer bg-[#2d1b69] text-white"
      >
        Get Started
      </button>
      </div>
    </div>
  );
};

// Main Controller Component
export default function OnboardingFlowController() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
  
  const handleNext = () => {
    if (currentStep < 1) {
      setCurrentStep(currentStep + 1);
    } else {
    // Redirect to dashboard.js when Get Started is clicked
    router.push('/dashboard');
  }
  };

  // Render the appropriate step component based on currentStep
  const renderStep = () => {
    if (currentStep) {
        return <TrackPeriodStep onNext={handleNext} />;
    }
  };

  return (
    <div className="h-full w-full">
      {renderStep()}
    </div>
  );
}