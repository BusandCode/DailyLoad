"use client"
import Link from 'next/link'
import React, { useState } from 'react'
import { getAuth, sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import { app } from '/lib/firebase'
// import Image from 'next/image';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const auth = getAuth(app);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    if (!email.trim()) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      // Check if the email exists first
      const methods = await fetchSignInMethodsForEmail(auth, email);
      
      if (methods.length === 0) {
        // Email not found in database
        setError("This email is not registered. Please sign up first.");
        setLoading(false);
        return;
      }
      
      // Send password reset email
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error) {
      console.error("Password reset error:", error);
      
      let errorMessage = "Failed to send password reset email. Please try again.";
      
      if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address. Please check and try again.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many password reset attempts. Please try again later.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen h-full lg:w-3/5 lg:mx-auto">
        <div className="w-full h-[123px] rounded-bl-[15px] rounded-br-[15px]">
            <div className="flex items-center gap-[10px] py-7 px-4">
                {/* <Link href="/login">
                    <Image src="/back-bg.png" width={20} height={20} alt="back-button" />
                </Link> */}
                <div>
                    <h1 className='text-white text-[16px] font-bold'>Reset Password</h1>
                    <h3 className='text-white text-[12px] font-normal'>We&apos;ll send you instructions to reset your password</h3>
                </div>
            </div>
            <form onSubmit={handleResetPassword} className='flex flex-col justify-center gap-[35px] items-center min-h-[calc(100vh-123px)]'>
                {error && (
                  <div className='bg-white text-red-700 px-4 py-2 rounded w-[334px]'>
                    {error}
                  </div>
                )}
                
                {success ? (
                  <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded w-[334px]'>
                    <p>Password reset email sent! Please check your inbox.</p>
                    <p className='mt-2 text-sm'>If you don&apos;t see it, please check your spam folder.</p>
                    <div className='mt-4'>
                      <Link 
                        href="/login" 
                        className='bg-[#BE185D] text-[#ffffff] flex justify-center items-center w-full min-h-[37px] rounded-[5px] p-[10px]'
                      >
                        Back to Login
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className='flex flex-col items-start'>
                      <label className='text-white text-[14px] font-light'>Email</label>
                      <input 
                        type="email" 
                        className='w-[334px] outline-none bg-[#FFFFFF]
                  h-[43px] rounded-[5px] p-[10px] text-[14px] text-[#11084a]' 
                        placeholder='youremail@gmail.com' 
                        maxLength={50}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <button 
                      type="submit"
                      className='w-[331px] h-[48px] text-[17px] border border-[#2d1b69] rounded-[5px] bg-[#2d1b69] text-[#fff] p-[10px] flex justify-center items-center hover:bg-[#11084a] transition ease-in cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Send Reset Instructions'}
                    </button>
                  </>
                )}
                
                <div className='text-center'>
                  <p className='text-white text-[14px] font-normal'>
                    Remember your password? <Link href="/login" className='font-medium'>Login</Link>
                  </p>
                </div>
            </form>
        </div>  
    </section>
  )
}

export default ResetPasswordPage