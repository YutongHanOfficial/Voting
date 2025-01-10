import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Replace with your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-4fuqlH4nK6xnWbgYJ_kAE6I-zmMsYW0",
  authDomain: "voting-ca95e.firebaseapp.com",
  databaseURL: "https://voting-ca95e-default-rtdb.firebaseio.com",
  projectId: "voting-ca95e",
  storageBucket: "voting-ca95e.firebasestorage.app",
  messagingSenderId: "70807736682",
  appId: "1:70807736682:web:7ef92ca8d58465c5881513",
  measurementId: "G-YZYR1FZHLQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
