// import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import LogoComponent from './LogoComponent'

const WelcomeScreen = () => {
  return (
    <section className='min-h-screen text-white flex items-center justify-center px-4'>
        <div className='flex flex-col justify-center items-center gap-8 max-w-md w-full'>
          {/* Header Texts */}
        <div className='flex flex-col justify-center items-center text-center space-y-2'>
          <h1 className='text-[30px] md:text-[36px] font-bold leading-tight'>
            Welcome to DailyLoad
          </h1>
          <h3 className='italic text-[15px] md:text-[17px] font-normal opacity-90'>
            Your personal task tracker
          </h3>
        </div>

        {/* Logo icon */}
        <LogoComponent />

    {/* Buttons */}
        <div className='w-full max-w-[400px] flex flex-col justify-center items-center gap-4'>
          <Link href="/login" className='bg-[#2d1b69] border border-[#2d1b69] flex justify-center items-center w-4/5 h-[48px]
          rounded-[10px] p-[10px] text-[#ffffff] text-[17px] font-normal cursor-pointer'>Login</Link>
          <Link href="/signup" className='bg-[#ffffff] flex justify-center items-center w-4/5 h-[48px]
          rounded-[10px] p-[10px] border-[1px] border-[#2d1b69]
          text-[17px] font-normal cursor-pointer text-[#11084a]'>Signup</Link>
        </div>
      </div>
    </section>
  )
}

export default WelcomeScreen

