import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCMnlpV8RSy6vZtavBGqKLnc1mBLInRZLg",
  authDomain: "junior-process.firebaseapp.com",
  projectId: "junior-process",
  storageBucket: "junior-process.appspot.com",
  messagingSenderId: "361799028758",
  appId: "1:361799028758:web:6e7b01abb38760c1e86537"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

import { getFirestore } from "firebase/firestore";
export const db = getFirestore(app);
