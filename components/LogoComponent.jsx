export default function LogoComponent() {
  return (
    // <div className="rounded-full h-[100px] w-[100px] bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center p-8">
      <div className="flex items-center gap-6">
        {/* Logo Icon */}
        <div className="relative w-20 h-20">
          {/* Outer gradient circle */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500"></div>
          
          {/* Inner circle (background cutout) */}
          <div className="absolute top-4 left-4 w-12 h-12 bg-slate-800 rounded-full"></div>
          
          {/* Checkmark container */}
          <div className="absolute top-6 left-6 w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
            <svg 
              className="w-5 h-5 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>
        
        {/* Logo Text */}
        {/* <h1 className="text-[20px] font-bold text-white tracking-wider">
          DAILYLOAD
        </h1> */}
      </div>
    // </div>
  );
}