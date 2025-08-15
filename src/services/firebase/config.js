import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB3P4TZht3vEOWcKC-qVg_5U_1dwA18N9g",
  authDomain: "calculadora-electrica.firebaseapp.com",
  projectId: "calculadora-electrica",
  storageBucket: "calculadora-electrica.firebasestorage.app",
  messagingSenderId: "376192628144",
  appId: "1:376192628144:web:a6910258ae73f285041275",
  measurementId: "G-0SP3LJCCZS"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;