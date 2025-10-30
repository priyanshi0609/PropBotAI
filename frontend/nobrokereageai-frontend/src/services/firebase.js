// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth,GoogleAuthProvider} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDf29Yo9orAoMK45WpzMHqMSlg8cVpMl9E",
  authDomain: "nobrokerageai.firebaseapp.com",
  projectId: "nobrokerageai",
  storageBucket: "nobrokerageai.firebasestorage.app",
  messagingSenderId: "908054666642",
  appId: "1:908054666642:web:8e106670a723a23f58354b",
  measurementId: "G-R8XVXD5V9Y"
};
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;