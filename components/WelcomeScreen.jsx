// import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import LogoComponent from './logoComponent'

const WelcomeScreen = () => {
  return (
    <section>
        <div className='flex flex-col justify-center items-center gap-6'>
        <div className='flex flex-col justify-center items-center'>
            <h1 className='text-[30px] font-bold'>Welcome to DailyLoad</h1>
            <h3 className='italic text-[15px] font-normal'>Your personal task tracker</h3>
        </div>
        {/* Logo icon */}
        <LogoComponent />
        {/* <Image src="/logo.JPG" width={200} height={200} alt='Logo' className='rounded-full'/> */}

        <div className='w-[400px] flex flex-col justify-center items-center  gap-[10px]'>
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
