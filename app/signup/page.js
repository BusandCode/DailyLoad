"use client"
import Link from 'next/link'
import Image from 'next/image'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
  updateProfile,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { app } from '/lib/firebase'

const SignupPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();
  const twitterProvider = new TwitterAuthProvider();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Basic validation
    if (!fullName.trim()) {
      setError('Please enter your full name');
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Please enter a password');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setError('You must agree to the terms and privacy policy');
      setLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting to create user with:', email.trim());
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      console.log('User created successfully:', userCredential.user.uid);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: fullName.trim()
      });
      console.log('Profile updated with display name:', fullName.trim());
      
      setSuccess('Account created successfully! Redirecting...');
      
      // Small delay to show success message
      setTimeout(() => {
        router.push('/signup/slides');
      }, 1500);
      
    } catch (error) {
      console.error("Signup error:", error);
      
      // Handle specific error codes
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please use a different email or try logging in.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Please use at least 6 characters with a mix of letters and numbers.");
      } else if (error.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection and try again.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many requests. Please wait a moment and try again.");
      } else {
        setError(`Failed to register: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = async (provider) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Social signup successful:', result.user.uid);
      setSuccess('Account created successfully! Redirecting...');
      
      setTimeout(() => {
        router.push('/signup/slides');
      }, 1500);
      
    } catch (error) {
      console.error("Social signup error:", error);
      
      if (error.code === "auth/account-exists-with-different-credential") {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, error.customData?.email);
          setError(`An account already exists with this email. Please try logging in with ${methods.join(", ")}.`);
        } catch {
          setError("An account already exists with this email but with different sign-in credentials.");
        }
      } else if (error.code === "auth/popup-closed-by-user") {
        setError("Sign-up cancelled. Please try again.");
      } else if (error.code === "auth/popup-blocked") {
        setError("Popup blocked. Please allow popups for this site and try again.");
      } else if (error.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection and try again.");
      } else {
        setError(`Social sign-up failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='h-full p-3'>
      <div>
        <div className='flex flex-col justify-center items-center gap-6 min-h-screen'>
          <div className='text-center'>
              <h1 className='text-white text-[25px] font-bold'>Sign Up</h1>
              <h3 className='text-[15px] font-normal text-white italic'>Welcome to DailyLoad</h3>
          </div>

          {error && (
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded w-[334px]'>
              {error}
            </div>
          )}

          {success && (
            <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded w-[334px]'>
              {success}
            </div>
          )}

          <form onSubmit={handleSignup} className='flex flex-col gap-4'>
            <div className='flex flex-col justify-center items-start gap-[10px]'>
              <div className='flex flex-col items-start gap-1'>
                <label className='text-white text-[14px] font-light'>Full Name</label>
                <input 
                  type="text" 
                  className='w-[334px] outline-none bg-[#FFFFFF]
                  h-[43px] rounded-[5px] p-[10px] text-[14px] text-[#11084a]' 
                  placeholder='Your Name' 
                  maxLength={50}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className='flex flex-col items-start gap-1'>
                <label className='text-white text-[14px] font-light'>Email</label>
                <input 
                  type="email" 
                  className='w-[334px] outline-none border-[1px] bg-[#FFFFFF]
                  h-[43px] rounded-[5px] p-[10px] text-[14px] text-[#11084a]' 
                  placeholder='youremail@gmail.com' 
                  maxLength={50}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className='flex flex-col items-start gap-1'>
                <label className='text-white text-[14px] font-light'>Password</label>
                <div className='relative w-[334px]'>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className='w-full outline-none bg-[#FFFFFF]
                    h-[43px] rounded-[5px] p-[10px] text-[14px] text-[#11084a]' 
                    placeholder='At least 6 characters'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
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
            
            {/* Terms and condition div */}
            <div>
              <article className='flex items-center gap-2'>
                <input 
                  type="checkbox" 
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className='w-4 h-4 text-white focus:ring-[#EC4899] border-[#FBCFE8] rounded'
                  disabled={loading}
                />
                <small className='text-white text-[14px] font-normal'>I agree to the terms and privacy policy</small>
              </article>
            </div>
          
            <button 
              type="submit" 
              className='w-full h-[48px] text-[17px] border border-[#2d1b69] rounded-[5px] bg-[#2d1b69] text-[#fff] p-[10px] flex justify-center items-center hover:bg-[#11084a] transition ease-in cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={loading}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
          
          <p className='text-white text-[14px] font-normal'>Or continue with</p>
          <article className='flex justify-center items-center gap-[20px]'>
            <button 
              onClick={() => handleSocialSignup(googleProvider)} 
              disabled={loading}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image src="/google.png" alt="google" width={48} height={48} />
            </button>
            <button 
              onClick={() => handleSocialSignup(facebookProvider)} 
              disabled={loading}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image src="/facebook.png" alt="facebook" width={48} height={48} />
            </button>
            <button 
              onClick={() => handleSocialSignup(twitterProvider)} 
              disabled={loading}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image src="/twitter.png" alt="twitter" width={48} height={48} />
            </button>
          </article>
          
          <p className='text-white text-[14px] font-normal'>
            Already have an account? <Link href="/login" className='font-medium'>Login</Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default SignupPage