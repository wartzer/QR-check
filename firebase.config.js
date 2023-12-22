// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCQ71t3Jf7JoVvdNPaP7bWl0k2vQsn7jYc",
  authDomain: "qr-app-98977.firebaseapp.com",
  projectId: "qr-app-98977",
  storageBucket: "qr-app-98977.appspot.com",
  messagingSenderId: "1028312354491",
  appId: "1:1028312354491:web:a073778127df2c8266a39e",
  measurementId: "G-91F94Q68M1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const fireStore = getFirestore(app);
export const storage = getStorage(app);
