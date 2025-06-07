"use client"
import Link from 'next/link'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getAuth, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { app } from '/lib/firebase'
import Image from 'next/image'

const Page = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();
  const twitterProvider = new TwitterAuthProvider();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push('/dashboard'); // Redirect to dashboard after successful login
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle specific error codes
      if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please check your credentials and try again.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later.");
      } else if (error.code === "auth/user-disabled") {
        setError("This account has been disabled. Please contact support.");
      } else if (error.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection and try again.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    setError('');
    
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard'); // Redirect to dashboard after successful login
    } catch (error) {
      console.error("Social login error:", error);
      
      if (error.code === "auth/account-exists-with-different-credential") {
        // Try to help the user by suggesting the providers they've used before
        try {
          const methods = await fetchSignInMethodsForEmail(auth, error.customData.email);
          setError(`An account already exists with this email. Please try logging in with ${methods.join(", ")}.`);
        } catch {
          setError("An account already exists with this email but with different sign-in credentials.");
        }
      } else if (error.code === "auth/popup-closed-by-user") {
        setError("Login cancelled. Please try again.");
      } else if (error.code === "auth/popup-blocked") {
        setError("Popup blocked. Please allow popups for this site and try again.");
      } else if (error.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection and try again.");
      } else {
        setError("Social login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='min-h-screen flex flex-col p-3'>
      {/* Back button - positioned at top */}
      <div className='mb-4'>
        {/* <div onClick={goBack} className='flex items-center gap-2'> 
          <IoIosArrowBack className='text-white text-[25px]'/>
          <small className='text-[white] text-[14px] font-normal'>Back</small>
        </div> */}
      </div>

      {/* Main content - centered */}
      <div className='flex-1 flex flex-col justify-center items-center'>
        <div className='flex flex-col justify-center items-center gap-6 w-full max-w-sm'>
          <div className='text-center'>
              <h1 className='text-white text-[25px] font-bold'>Login</h1>
              <h3 className='text-[15px] font-normal italic text-white'>Welcome back to DailyLoad</h3>
          </div>

          {error && (
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded w-full'>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className='flex flex-col gap-4 w-full'>
            <div className='flex flex-col justify-center items-start gap-[10px]'>
              <div className='flex flex-col items-start gap-1 w-full'>
                <label className='text-white text-[14px] font-light'>Email</label>
                <input 
                  type="email" 
                  className='w-full outline-none border-[1px] 
                  bg-[#FFFFFF] border-[#2d1b69] h-[43px] rounded-[5px] 
                  p-[10px] text-[14px] text-[#11084a]' 
                  placeholder='youremail@gmail.com' 
                  maxLength={50}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className='flex flex-col items-start gap-1 w-full'>
                <label className='text-white text-[14px] font-light'>Password</label>
                <div className='relative w-full'>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className='w-full outline-none border-[1px] bg-[#FFFFFF] border-[#2d1b69] h-[43px] rounded-[5px] p-[10px] text-[14px] text-[#11084a]' 
                    placeholder='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#2d1b69" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#2d1b69" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <Link href="/reset-password" className='text-[14px] text-white font-medium flex justify-end'>Forgot Password?</Link>
          
            <button 
              type="submit" 
              className='w-full h-[48px] text-[17px] border border-[#2d1b69] rounded-[5px] bg-[#2d1b69] text-[#fff] p-[10px] flex justify-center items-center hover:bg-[#11084a] transition ease-in cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <p className='text-white text-[14px] font-normal'>Or continue with</p>
          <article className='flex justify-center items-center gap-[20px]'>
            <button 
              onClick={() => handleSocialLogin(googleProvider)} 
              disabled={loading}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image src="/google.png" alt="google" width={48} height={48} />
            </button>
            <button 
              onClick={() => handleSocialLogin(facebookProvider)} 
              disabled={loading}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image src="/facebook.png" alt="facebook" width={48} height={48} />
            </button>
            <button 
              onClick={() => handleSocialLogin(twitterProvider)} 
              disabled={loading}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image src="/twitter.png" alt="twitter" width={48} height={48} />
            </button>
          </article>
          
          <p className='text-white text-[14px] font-normal'>
            Don&apos;t have an account? <Link href="/signup" className='font-medium'>Sign up</Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default Page