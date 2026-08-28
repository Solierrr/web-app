// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFJVRTqTZOyLQfBnfebC7aV-B1c2gQ0AU",
  authDomain: "solaria-authenticator.firebaseapp.com",
  projectId: "solaria-authenticator",
  storageBucket: "solaria-authenticator.firebasestorage.app",
  messagingSenderId: "941750221500",
  appId: "1:941750221500:web:55d42226a9cb44fdd36eb9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);