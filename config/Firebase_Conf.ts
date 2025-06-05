// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
 // @ts-ignore
import { getReactNativePersistence, GoogleAuthProvider, FacebookAuthProvider, initializeAuth } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'
import {getFirestore, collection} from 'firebase/firestore'
import { getStorage } from "firebase/storage"; // Importar Firebase Storage
// @ts-ignore

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const storage = getStorage(app); // Inicializar Firebase Storage

export const webCLientIdGoogle = process.env.EXPO_PUBLIC_WEB_CLIENT_ID_GOOGLE
export const iosClientIdGoogle = process.env.EXPO_PUBLIC_IOS_CLIENT_ID_GOOGLE
export const androidClientIdGoogle = process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID_GOOGLE