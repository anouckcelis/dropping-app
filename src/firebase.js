// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAutfPA8DkQ2hcltggnunI0UHJJWgF4zbA",
  authDomain: "dropping-itspot.firebaseapp.com",
  projectId: "dropping-itspot",
  storageBucket: "dropping-itspot.appspot.com",
  messagingSenderId: "450177881830",
  appId: "1:450177881830:web:485cd47c8ac486b62f8d27",
  measurementId: "G-T5Y6N422YL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };