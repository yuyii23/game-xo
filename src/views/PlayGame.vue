<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { databaseURL } from '@/firebase';
import { googleLogout } from 'vue3-google-login';
import Version from '@/components/Version.vue';
import Star from '@/assets/star.webp';
import Star1 from '@/assets/star-1.webp';

const router = useRouter();

const playerTurn = 'X';
const botTurn = 'O';

interface UserData {
  photoURL?: string;
  displayName?: string;
  points?: number;
  winStreak?: number;
}

const board = ref<string[]>(Array(9).fill(''));
const currentTurn = ref<string>(playerTurn);
const winner = ref<string | null>(null);
const difficulty = ref<string>('expert');
const winningCells = ref<number[]>([]);
const userData = ref<UserData | null>(null);
const userId = ref<string | null>(null);
const points = ref<number>(0);
const winStreak = ref<number>(0);

const pointsChange = ref<string>('');
const bigPointsAnimation = ref<boolean>(false);

const winnerMessage = computed(() => {
  if (winner.value === playerTurn) return 'You Win!';
  if (winner.value === botTurn) return 'You Lose!';
  if (winner.value === 'tie') return "It's a Tie!";
  return '';
});

onMounted(async () => {
  const storedUserId = localStorage.getItem('userId');
  if (storedUserId) {
    userId.value = storedUserId;
    await fetchUserData(storedUserId);
  }
});

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
  router.push({ path: '/' });
}

async function updateUserPoints() {
  if (!userId.value) return;
  try {
    await axios.patch(`${databaseURL}/users/${userId.value}.json`, {
      points: points.value,
      winStreak: winStreak.value,
    });
  } catch (error) {
    console.error('Error updating points and win streak in Firebase:', error);
  }
}

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
  if (emptyCells.length === 0 || winner.value) return;

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
  const result = checkWinner(board.value, turn);
  if (result) {
    winner.value = turn;
    winningCells.value = result;
    updatePoints(turn === playerTurn ? 1 : -1);
    return true;
  }
  if (!board.value.includes('')) {
    winner.value = 'tie';
    updatePoints(0);
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

function checkWinner(boardState: string[], turn: string): number[] | null {
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6],            // Diagonals
  ];
  return winningCombinations.find((combination) =>
    combination.every((index) => boardState[index] === turn)
  ) || null;
}

function minimax(newBoard: string[], player: string): { index?: number; score: number } {
  const emptyCells = newBoard
    .map((cell, index) => (cell === '' ? index : null))
    .filter((index): index is number => index !== null);

  if (checkWinner(newBoard, playerTurn)) return { score: -10 };
  if (checkWinner(newBoard, botTurn)) return { score: 10 };
  if (emptyCells.length === 0) return { score: 0 };

  const moves = emptyCells.map((index) => {
    newBoard[index] = player;
    const result = minimax(newBoard, player === botTurn ? playerTurn : botTurn);
    const score = result.score;
    newBoard[index] = '';
    return { index, score };
  });

  if (player === botTurn) {
    return moves.reduce(
      (best, move) => (move.score > best.score ? move : best),
      { score: -Infinity }
    );
  } else {
    return moves.reduce(
      (best, move) => (move.score < best.score ? move : best),
      { score: Infinity }
    );
  }
}

function getEmptyCells() {
  return board.value
    .map((cell, index) => (cell === '' ? index : null))
    .filter((index): index is number => index !== null);
}

function updatePoints(result: number) {
  if (result === 1) {
    points.value += 1;
    pointsChange.value = '+1';
    winStreak.value += 1;

    if (winStreak.value === 3) {
      points.value += 1;
      pointsChange.value = '+2';
      bigPointsAnimation.value = true;
      winStreak.value = 0;
    }
  } else if (result === -1) {
    if (points.value > 0) {
      points.value -= 1;
      pointsChange.value = '-1';
    }
    winStreak.value = 0;
  } else {
    winStreak.value = 0;
  }
  updateUserPoints();

  setTimeout(() => {
    pointsChange.value = '';
  }, 1000);

  if (bigPointsAnimation.value) {
    setTimeout(() => {
      bigPointsAnimation.value = false;
    }, 1500);
  }
}

watch(difficulty, resetGame);
</script>

<template>
  <div class="game content">
    <div class="player-info" v-if="userData">
      <div>
        <div class="box-stars">
          <img :src="winStreak >= 1 ? Star : Star1" alt="star" class="star" />
          <img :src="winStreak >= 2 ? Star : Star1" alt="star" class="star" />
          <img :src="winStreak >= 3 ? Star : Star1" alt="star" class="star" />
        </div>
      </div>
      <p class="player-name" v-if="userData.displayName">{{ userData.displayName }}</p>
    </div>

    <div class="points">
      <div class="custom-select-wrapper">
        <select v-model="difficulty">
          <option value="beginner">Beginner</option>
          <option value="expert">Expert</option>
        </select>
      </div>
      <p class="text-points">
        <span v-if="pointsChange" :class="[
          'points-animation', {
            positive: pointsChange === '+1',
            negative: pointsChange === '-1'
          }]">
          {{ pointsChange }}
        </span>
        {{ points }}
      </p>
    </div>
    <div class="board">
      <div v-if="bigPointsAnimation" class="big-points-animation"> +1 Extra Point</div>
      <div v-if="winnerMessage" class="winner-overlay">
        <p>{{ winnerMessage }}</p>
      </div>
      <div v-for="(cell, index) in board" :key="index"
        :class="['cell',
          {
            'winning-cell': winningCells.includes(index),
            'x-cell': cell === 'X',
            'o-cell': cell === 'O',
          },]" @click="makeMove(index)">

        {{ cell }}
      </div>
    </div>

    <div class="btn-wrapper">
      <button class="button" @click="resetGame" :disabled="winner === null">Play Again</button>
      <button class="button" @click="handleLogout">Logout</button>
    </div>
    <Version /> 
  </div>
</template>
