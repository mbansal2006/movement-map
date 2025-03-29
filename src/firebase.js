
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDqtlnqNMp1vxB69dmKLqGu8Y89gK4UvGE",
  authDomain: "btr-movement-map.firebaseapp.com",
  projectId: "btr-movement-map",
  storageBucket: "btr-movement-map.firebasestorage.app",
  messagingSenderId: "619678666477",
  appId: "1:619678666477:web:eb79906880a7a2b9ab86e4",
  measurementId: "G-QEXYNWKBP9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };
