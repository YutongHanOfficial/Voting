import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM elements
const item1Div = document.getElementById("item1");
const item2Div = document.getElementById("item2");
const mostLikedList = document.getElementById("mostLikedList");
const leastLikedList = document.getElementById("leastLikedList");

let items = [];
let votesData = {};
let shuffledIndexes = [];
let currentIndex = 0;

// Fetch items and votes data
async function init() {
  try {
    const [itemsResponse, votesSnapshot] = await Promise.all([
      fetch("items.json"),
      get(ref(db, "votes"))
    ]);

    const itemsData = await itemsResponse.json();
    items = itemsData.items;

    votesData = votesSnapshot.exists() ? votesSnapshot.val() : {};
    shuffledIndexes = shuffleArray([...Array(items.length).keys()]);
    generateRandomItems();
    loadLeaderboard();
  } catch (error) {
    console.error("Error initializing app:", error);
  }
}

// Shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Generate random items
function generateRandomItems() {
  if (shuffledIndexes.length < 2) {
    shuffledIndexes = shuffleArray([...Array(items.length).keys()]);
    currentIndex = 0;
  }

  const item1Index = shuffledIndexes[currentIndex++];
  const item2Index = shuffledIndexes[currentIndex++];
  const item1 = items[item1Index];
  const item2 = items[item2Index];

  updateUI(item1, item2);
}

// Update UI
function updateUI(item1, item2) {
  const data1 = votesData[item1.id] || { votes: 0, wins: 0, losses: 0 };
  const data2 = votesData[item2.id] || { votes: 0, wins: 0, losses: 0 };

  item1Div.querySelector(".name").textContent = item1.name;
  item1Div.querySelector(".stats").textContent = `Votes: ${data1.votes}, Wins: ${data1.wins}, Losses: ${data1.losses}`;
  item2Div.querySelector(".name").textContent = item2.name;
  item2Div.querySelector(".stats").textContent = `Votes: ${data2.votes}, Wins: ${data2.wins}, Losses: ${data2.losses}`;

  // Voting system
  item1Div.onclick = () => saveVote(item1.id, item2.id);
  item2Div.onclick = () => saveVote(item2.id, item1.id);
}

// Save vote and update leaderboard
function saveVote(winnerId, loserId) {
  votesData[winnerId] = votesData[winnerId] || { name: items.find(item => item.id === winnerId).name, votes: 0, wins: 0, losses: 0 };
  votesData[loserId] = votesData[loserId] || { name: items.find(item => item.id === loserId).name, votes: 0, wins: 0, losses: 0 };

  // Update votes
  votesData[winnerId].votes++;
  votesData[winnerId].wins++;
  votesData[loserId].votes++;
  votesData[loserId].losses++;

  // Update Firebase with the new data
  update(ref(db, "votes"), {
    [winnerId]: votesData[winnerId],
    [loserId]: votesData[loserId]
  });

  generateRandomItems();  // Get the next random items
  loadLeaderboard();  // Reload leaderboard
}

// Load leaderboard
function loadLeaderboard() {
  const itemsArray = Object.entries(votesData).map(([id, data]) => {
    const winPercentage = data.votes > 0 ? (data.wins / data.votes) * 100 : 0;
    return { id, name: data.name, winPercentage };  // Store id and name
  });

  // Sort by win percentage
  itemsArray.sort((a, b) => b.winPercentage - a.winPercentage);
  const mostLiked = itemsArray.slice(0, 10);  // Top 10
  const leastLiked = itemsArray.slice(-10);  // Bottom 10

  updateLeaderboardUI(mostLiked, leastLiked);  // Update the UI
}

// Update leaderboard UI
function updateLeaderboardUI(mostLiked, leastLiked) {
  mostLikedList.innerHTML = mostLiked.map(item => `<li>${item.name} - ${item.winPercentage.toFixed(2)}%</li>`).join("");
  leastLikedList.innerHTML = leastLiked.map(item => `<li>${item.name} - ${item.winPercentage.toFixed(2)}%</li>`).join("");
}

// Initialize app
init();
