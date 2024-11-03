<template>
  <div class="game content">

    <!-- User Information Section -->
    <div class="player-info" v-if="userData">
      <div>
      <p>Win Streak: {{ winStreak }}</p>
      <label>Mode: </label>
    <select v-model="difficulty">
      <option value="beginner">Beginner</option>
      <option value="expert">Expert</option>
    </select>
</div>
      <div>
      <p v-if="userData.displayName"> {{ userData.displayName }}!</p>
      <p>Points: {{ points }}</p>
    </div>
   
    </div>
    
    
    <!-- Game Board -->
    <div class="board">
      <div
        v-for="(cell, index) in board"
        :key="index"
        :class="['cell', { 'winning-cell': winningCells.includes(index) }]"
        @click="makeMove(index)"
      >
        {{ cell }}
      </div>
    </div>

    <!-- Game Result Section -->
    <div v-if="winner" class="result">
      <p>{{ winnerMessage }}</p>
      <button @click="resetGame">Play Again</button>
    </div>
    <p @click="handleLogout">Logout</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'; // Updated import
import { databaseURL } from '@/firebase';
import { googleLogout } from 'vue3-google-login';

const router = useRouter(); // Initialized router instance

const playerTurn = 'X';
const botTurn = 'O';

interface UserData {
  photoURL?: string;
  displayName?: string;
  points?: number;
  winStreak?: number;
}

// Reactive Variables
const board = ref<string[]>(Array(9).fill(''));
const currentTurn = ref<string>(playerTurn);
const winner = ref<string | null>(null);
const difficulty = ref<string>('expert');
const winningCells = ref<number[]>([]);
const userData = ref<UserData | null>(null);
const userId = ref<string | null>(null);
const points = ref<number>(0);
const winStreak = ref<number>(0);

// Computed Properties
const winnerMessage = computed(() => {
  return winner.value === 'tie' ? "It's a tie!" : `${winner.value} wins the game!`;
});

// Lifecycle Hooks
onMounted(async () => {
  const storedUserId = localStorage.getItem('userId');
  if (storedUserId) {
    userId.value = storedUserId;
    await fetchUserData(storedUserId);
  }
});

// Function Groups
// 1. User Management Functions
async function fetchUserData(id: string) {
  try {
    const response = await axios.get(`${databaseURL}/users/${id}.json`);
    userData.value = response.data;
    points.value = userData.value?.points || 0;
    winStreak.value = userData.value?.winStreak || 0;
  } catch (error) {
    console.error('Error fetching user data from Firebase:', error);
  }
}

function handleLogout() {
  googleLogout();
  localStorage.removeItem('userId');
  localStorage.removeItem('user');
  router.push({ path: '/' }); // Navigate to home page
}

async function updateUserPoints() {
  if (!userId.value) return;
  try {
    await axios.patch(`${databaseURL}/users/${userId.value}.json`, {
      points: points.value,
      winStreak: winStreak.value,
    });
    console.log('Points and Win Streak updated in Firebase:', points.value, winStreak.value);
  } catch (error) {
    console.error('Error updating points and win streak in Firebase:', error);
  }
}

// 2. Game Logic Functions
function makeMove(index: number) {
  if (winner.value || board.value[index] !== '' || currentTurn.value !== playerTurn) return;

  board.value[index] = playerTurn;
  if (checkForResult(playerTurn)) return;

  currentTurn.value = botTurn;
  setTimeout(() => {
    if (!winner.value) botMove();
  }, 300);
}

function botMove() {
  const emptyCells = getEmptyCells();
  if (emptyCells.length === 0 || winner.value) return; // Prevent move if game is over

  if (difficulty.value === 'beginner') {
    board.value[emptyCells[Math.floor(Math.random() * emptyCells.length)]] = botTurn;
  } else {
    const bestMove = minimax([...board.value], botTurn).index;
    if (bestMove !== undefined) board.value[bestMove] = botTurn;
  }
  checkForResult(botTurn);
  currentTurn.value = playerTurn;
}

function checkForResult(turn: string): boolean {
  const result = checkWinner(turn);
  if (result) {
    winner.value = turn;
    winningCells.value = result;
    updatePoints(turn === playerTurn ? 1 : -1);
    return true;
  }
  if (!board.value.includes('')) {
    winner.value = 'tie';
    return true;
  }
  return false;
}

function resetGame() {
  board.value = Array(9).fill('');
  winner.value = null;
  currentTurn.value = playerTurn;
  winningCells.value = [];
}

// 3. Utility Functions
function checkWinner(turn: string) {
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  return (
    winningCombinations.find((combination) =>
      combination.every((index) => board.value[index] === turn)
    ) || null
  );
}

function minimax(newBoard: string[], player: string): { index?: number; score: number } {
  const emptyCells = newBoard
    .map((cell, index) => (cell === '' ? index : null))
    .filter((index) => index !== null) as number[];

  if (checkWinner(playerTurn)) return { score: -10 };
  if (checkWinner(botTurn)) return { score: 10 };
  if (emptyCells.length === 0) return { score: 0 };

  const moves = emptyCells.map((index) => {
    const boardCopy = [...newBoard];
    boardCopy[index] = player;

    const score =
      player === botTurn
        ? minimax(boardCopy, playerTurn).score
        : minimax(boardCopy, botTurn).score;

    return { index, score };
  });

  return player === botTurn
    ? moves.reduce(
        (bestMove, move) => (move.score > bestMove.score ? move : bestMove),
        { score: -Infinity }
      )
    : moves.reduce(
        (bestMove, move) => (move.score < bestMove.score ? move : bestMove),
        { score: Infinity }
      );
}

function getEmptyCells() {
  return board.value
    .map((cell, index) => (cell === '' ? index : null))
    .filter((index) => index !== null) as number[];
}

// 4. Point Management Functions
function updatePoints(result: number) {
  if (result === 1) {
    points.value += 1;
    winStreak.value += 1;
    if (winStreak.value === 3) {
      points.value += 1; // Bonus point when winning 3 times in a row
      winStreak.value = 0;
    }
  } else {
    if (points.value > 0) {
      points.value -= 1; // Decrease point when lose or tie, but not less than 0
    }
    winStreak.value = 0; // Reset streak when lose or tie
  }
  updateUserPoints();
}

watch(difficulty, resetGame);
</script>


