// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBJEP-hJzSdYXEX5q_hPE3aXG7F74wCzWQ",
  authDomain: "kan-qr.firebaseapp.com",
  projectId: "kan-qr",
  storageBucket: "kan-qr.appspot.com",
  messagingSenderId: "617428695704",
  appId: "1:617428695704:web:5c2c5de3bfbcd04aacaeed",
  measurementId: "G-68WB56PXZ9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const fireStore = getFirestore(app);
export const storage = getStorage(app);
