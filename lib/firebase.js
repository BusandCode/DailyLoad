// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
} from "firebase/auth";
// TODO Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCeoAXwzP-g-ZlLmkIjm0EBV1bWw95rb98",
  authDomain: "sade-period-tracker.firebaseapp.com",
  projectId: "sade-period-tracker",
  storageBucket: "sade-period-tracker.firebasestorage.app",
  messagingSenderId: "234697371405",
  appId: "1:234697371405:web:ff90499006449cb6f24a44"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

//Auth providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();

//google
export const signInWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

//facebook
export const signInWithFacebook = async () => {
  try {
    const userCredential = await signInWithPopup(auth, facebookProvider);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

//twitter
export const signInWithTwitter = async () => {
  try {
    const userCredential = await signInWithPopup(auth, twitterProvider);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Export both app and auth
export { app, auth };
export const db = getFirestore(app);