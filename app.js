import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD-4fuqlH4nK6xnWbgYJ_kAE6I-zmMsYW0",
  authDomain: "voting-ca95e.firebaseapp.com",
  databaseURL: "https://voting-ca95e-default-rtdb.firebaseio.com",
  projectId: "voting-ca95e",
  storageBucket: "voting-ca95e.appspot.com",
  messagingSenderId: "70807736682",
  appId: "1:70807736682:web:7ef92ca8d58465c5881513",
  measurementId: "G-YZYR1FZHLQ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM Elements
const item1Div = document.getElementById("item1");
const item2Div = document.getElementById("item2");
const mostLikedList = document.getElementById("mostLikedList");
const leastLikedList = document.getElementById("leastLikedList");

let items = [];
let currentPair = [];
let leaderboardCache = { mostLiked: [], leastLiked: [] };

// Fetch items and initialize the app
fetch("items.json")
  .then((response) => response.json())
  .then((data) => {
    items = data.items;
    generateRandomItems();
    loadLeaderboard();
  })
  .catch((error) => console.error("Error loading items:", error));

// Generate random items
function generateRandomItems() {
  const shuffled = items.sort(() => Math.random() - 0.5);
  currentPair = [shuffled[0], shuffled[1]];
  updateUI();
}

// Update UI with current items
function updateUI() {
  const [item1, item2] = currentPair;

  Promise.all([
    get(ref(db, `votes/${item1}`)),
    get(ref(db, `votes/${item2}`))
  ]).then(([item1Snapshot, item2Snapshot]) => {
    const item1Data = item1Snapshot.exists() ? item1Snapshot.val() : { votes: 0, wins: 0, losses: 0 };
    const item2Data = item2Snapshot.exists() ? item2Snapshot.val() : { votes: 0, wins: 0, losses: 0 };

    item1Div.querySelector(".name").textContent = item1;
    item1Div.querySelector(".stats").textContent = `Votes: ${item1Data.votes}, Wins: ${item1Data.wins}, Losses: ${item1Data.losses}`;

    item2Div.querySelector(".name").textContent = item2;
    item2Div.querySelector(".stats").textContent = `Votes: ${item2Data.votes}, Wins: ${item2Data.wins}, Losses: ${item2Data.losses}`;
  });
}

// Save vote and update Firebase
function saveVote(winner, loser) {
  const updates = {};

  updates[`votes/${winner}/votes`] = { ".sv": { increment: 1 } };
  updates[`votes/${winner}/wins`] = { ".sv": { increment: 1 } };
  updates[`votes/${loser}/votes`] = { ".sv": { increment: 1 } };
  updates[`votes/${loser}/losses`] = { ".sv": { increment: 1 } };

  update(ref(db), updates).then(() => {
    generateRandomItems();
    loadLeaderboard();
  });
}

// Event Listeners
item1Div.addEventListener("click", () => saveVote(currentPair[0], currentPair[1]));
item2Div.addEventListener("click", () => saveVote(currentPair[1], currentPair[0]));

// Load leaderboard
function loadLeaderboard() {
  get(ref(db, "votes"))
    .then((snapshot) => {
      if (!snapshot.exists()) return;

      const votesData = snapshot.val();
      const itemsArray = Object.entries(votesData).map(([name, stats]) => {
        const winRate = stats.votes > 0 ? (stats.wins / stats.votes) * 100 : 0;
        return { name, winRate };
      });

      leaderboardCache.mostLiked = itemsArray
        .slice()
        .sort((a, b) => b.winRate - a.winRate)
        .slice(0, 10);
      leaderboardCache.leastLiked = itemsArray
        .slice()
        .sort((a, b) => a.winRate - b.winRate)
        .slice(0, 10);

      updateLeaderboardUI();
    })
    .catch((error) => console.error("Error loading leaderboard:", error));
}

// Update leaderboard UI
function updateLeaderboardUI() {
  mostLikedList.innerHTML = leaderboardCache.mostLiked
    .map((item) => `<li>${item.name} - ${item.winRate.toFixed(2)}%</li>`)
    .join("");

  leastLikedList.innerHTML = leaderboardCache.leastLiked
    .map((item) => `<li>${item.name} - ${item.winRate.toFixed(2)}%</li>`)
    .join("");
}
