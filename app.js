import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Firebase config
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
const db = getDatabase(app);

// Items array
const items = ["Oxygen", "Water", "Internet", "Sleep", "Laughter", "Music", "Love", "Food"];

// DOM Elements
const item1Div = document.getElementById("item1");
const item2Div = document.getElementById("item2");
const vote1Button = document.getElementById("vote1");
const vote2Button = document.getElementById("vote2");

// Generate random items
let currentPair = [];
function generateRandomItems() {
  const item1 = items[Math.floor(Math.random() * items.length)];
  let item2 = items[Math.floor(Math.random() * items.length)];
  while (item1 === item2) {
    item2 = items[Math.floor(Math.random() * items.length)];
  }
  currentPair = [item1, item2];
  item1Div.textContent = item1;
  item2Div.textContent = item2;
}
generateRandomItems();

// Save vote to Firebase
function saveVote(item) {
  const itemRef = ref(db, `votes/${item}`);
  get(itemRef).then((snapshot) => {
    const currentVotes = snapshot.exists() ? snapshot.val() : 0;
    update(itemRef, currentVotes + 1);
    generateRandomItems();
  });
}

// Event Listeners
vote1Button.addEventListener("click", () => saveVote(currentPair[0]));
vote2Button.addEventListener("click", () => saveVote(currentPair[1]));
