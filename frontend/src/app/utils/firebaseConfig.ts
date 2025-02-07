import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyADLifqRUNWLWzpbopFAM7eIPYdrHmqO68",
    authDomain: "spectraderma.firebaseapp.com",
    projectId: "spectraderma",
    storageBucket: "spectraderma.firebasestorage.app",
    messagingSenderId: "238839191127",
    appId: "1:238839191127:web:7d8e14ee0096a76434b512",
    measurementId: "G-5VJNR9DXEZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);