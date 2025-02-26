import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyADLifqRUNWLWzpbopFAM7eIPYdrHmqO68",
    authDomain: "spectraderma.firebaseapp.com",
    databaseURL: "https://spectraderma-default-rtdb.firebaseio.com",
    projectId: "spectraderma",
    storageBucket: "spectraderma.firebasestorage.app",
    messagingSenderId: "238839191127",
    appId: "1:238839191127:web:50c2e7350963ba3934b512",
    measurementId: "G-81K75LWZCD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);