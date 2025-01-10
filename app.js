import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Firebase configuration
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

// DOM elements
const item1Div = document.getElementById("item1");
const item2Div = document.getElementById("item2");
const vote1Button = document.getElementById("vote1");
const vote2Button = document.getElementById("vote2");

let items = [];
let currentPair = [];

// Fetch items from JSON file
fetch('items.json')
  .then(response => response.json())
  .then(data => {
    items = data.items;
    generateRandomItems(); // Generate the first pair of items
  })
  .catch(error => {
    console.error('Error loading items:', error);
  });

// Generate random items
function generateRandomItems() {
  const item1 = items[Math.floor(Math.random() * items.length)];
  let item2 = items[Math.floor(Math.random() * items.length)];
  while (item1 === item2) {
    item2 = items[Math.floor(Math.random() * items.length)];
  }
  currentPair = [item1, item2];
  updateUI();
}

// Update the UI with item names and stats
function updateUI() {
  const [item1, item2] = currentPair;

  get(ref(db, `votes/${item1}`)).then(snapshot => {
    const data = snapshot.exists() ? snapshot.val() : { votes: 0, wins: 0, losses: 0 };
    item1Div.querySelector(".name").textContent = item1;
    item1Div.querySelector(".stats").textContent = `Votes: ${data.votes}, Wins: ${data.wins}, Losses: ${data.losses}`;
  });

  get(ref(db, `votes/${item2}`)).then(snapshot => {
    const data = snapshot.exists() ? snapshot.val() : { votes: 0, wins: 0, losses: 0 };
    item2Div.querySelector(".name").textContent = item2;
    item2Div.querySelector(".stats").textContent = `Votes: ${data.votes}, Wins: ${data.wins}, Losses: ${data.losses}`;
  });
}

// Save vote to Firebase and update win/loss counts
function saveVote(winner, loser) {
  const winnerRef = ref(db, `votes/${winner}`);
  const loserRef = ref(db, `votes/${loser}`);

  // Update winner stats
  get(winnerRef).then(snapshot => {
    const data = snapshot.exists() ? snapshot.val() : { votes: 0, wins: 0, losses: 0 };
    update(winnerRef, {
      votes: data.votes + 1, // Increase the votes for the winner
      wins: data.wins + 1,   // Increase the wins for the winner
      losses: data.losses   // The losses stay the same
    });
  });

  // Update loser stats
  get(loserRef).then(snapshot => {
    const data = snapshot.exists() ? snapshot.val() : { votes: 0, wins: 0, losses: 0 };
    update(loserRef, {
      votes: data.votes + 1,  // Increase the votes for the loser
      wins: data.wins,        // The wins stay the same
      losses: data.losses + 1 // Increase the losses for the loser
    });
  });

  // Generate a new pair after voting
  generateRandomItems();
}

// Event listeners
vote1Button.addEventListener("click", () => saveVote(currentPair[0], currentPair[1]));
vote2Button.addEventListener("click", () => saveVote(currentPair[1], currentPair[0]));
