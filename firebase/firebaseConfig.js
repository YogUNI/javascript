// src/firebase/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Ganti dengan konfigurasi Firebase Anda
const firebaseConfig = {
    apiKey: "AIzaSyB2skSZhyYWDpv-huibllUdr6io2ZvUbUM",
    authDomain: "parfum-store-6071b.firebaseapp.com",
    projectId: "parfum-store-6071b",
    storageBucket: "parfum-store-6071b.firebasestorage.app",
    messagingSenderId: "689807452095",
    appId: "1:689807452095:web:0616f52649d9da761de30a",
    measurementId: "G-XX128R4M0C"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };