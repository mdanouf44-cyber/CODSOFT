const cells = [...document.querySelectorAll(".cell")];
const statusText = document.getElementById("status-text");
const resetButton = document.getElementById("reset-btn");
const soundButton = document.getElementById("sound-btn");
const choiceButtons = [...document.querySelectorAll(".choice-btn")];
const playerLabel = document.getElementById("player-label");
const aiLabel = document.getElementById("ai-label");
const playerScore = document.getElementById("player-score");
const drawScore = document.getElementById("draw-score");
const aiScore = document.getElementById("ai-score");

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

let board = Array(9).fill("");
let playerSymbol = "X";
let aiSymbol = "O";
let gameActive = true;
let currentTurn = "X";
let soundEnabled = true;
const scores = {
  player: 0,
  draw: 0,
  ai: 0
};

function updateScoreboard() {
  playerScore.textContent = scores.player;
  drawScore.textContent = scores.draw;
  aiScore.textContent = scores.ai;
}

function playToneSequence(notes) {
  if (!soundEnabled) {
    return;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  if (!playToneSequence.audioContext) {
    playToneSequence.audioContext = new AudioContextClass();
  }

  const audioContext = playToneSequence.audioContext;
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  let offset = 0;

  notes.forEach(({ frequency, duration, type = "sine", volume = 0.035 }) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const startTime = audioContext.currentTime + offset;
    const endTime = startTime + duration;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(endTime);

    offset += duration * 0.82;
  });
}

function updateLabels() {
  playerLabel.textContent = `You: ${playerSymbol}`;
  aiLabel.textContent = `AI: ${aiSymbol}`;
}

function renderBoard(highlightedLine = []) {
  cells.forEach((cell, index) => {
    const mark = board[index];
    const previousMark = cell.textContent;
    cell.textContent = mark;
    cell.disabled = !gameActive || mark !== "" || currentTurn !== playerSymbol;
    cell.classList.toggle("player-mark", mark === playerSymbol);
    cell.classList.toggle("ai-mark", mark === aiSymbol);
    cell.classList.toggle("win", highlightedLine.includes(index));
    if (mark !== "" && previousMark !== mark) {
      cell.classList.remove("pop");
      void cell.offsetWidth;
      cell.classList.add("pop");
    }
  });
}

function getWinner(boardState) {
  for (const line of winningLines) {
    const [a, b, c] = line;
    if (
      boardState[a] &&
      boardState[a] === boardState[b] &&
      boardState[a] === boardState[c]
    ) {
      return { winner: boardState[a], line };
    }
  }

  if (boardState.every((cell) => cell !== "")) {
    return { winner: "draw", line: [] };
  }

  return null;
}

function setStatus(message) {
  statusText.textContent = message;
}

function finishGame(result) {
  gameActive = false;

  if (result.winner === "draw") {
    scores.draw += 1;
    updateScoreboard();
    playToneSequence([
      { frequency: 420, duration: 0.12, type: "triangle" },
      { frequency: 420, duration: 0.12, type: "triangle" }
    ]);
    setStatus("Draw. The AI does not blink.");
    renderBoard();
    return;
  }

  renderBoard(result.line);
  if (result.winner === playerSymbol) {
    scores.player += 1;
    updateScoreboard();
    playToneSequence([
      { frequency: 659, duration: 0.11, type: "triangle" },
      { frequency: 880, duration: 0.18, type: "triangle" }
    ]);
    setStatus("You won. That should not happen against perfect play.");
  } else {
    scores.ai += 1;
    updateScoreboard();
    playToneSequence([
      { frequency: 240, duration: 0.14, type: "sawtooth" },
      { frequency: 180, duration: 0.2, type: "sawtooth" }
    ]);
    setStatus("AI wins. Minimax closes the game.");
  }
}

function switchTurn() {
  currentTurn = currentTurn === "X" ? "O" : "X";
}

function minimax(boardState, isMaximizing, depth, alpha, beta) {
  const result = getWinner(boardState);
  if (result) {
    if (result.winner === aiSymbol) {
      return 10 - depth;
    }
    if (result.winner === playerSymbol) {
      return depth - 10;
    }
    return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < boardState.length; i += 1) {
      if (boardState[i] !== "") {
        continue;
      }
      boardState[i] = aiSymbol;
      const score = minimax(boardState, false, depth + 1, alpha, beta);
      boardState[i] = "";
      bestScore = Math.max(bestScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) {
        break;
      }
    }
    return bestScore;
  }

  let bestScore = Infinity;
  for (let i = 0; i < boardState.length; i += 1) {
    if (boardState[i] !== "") {
      continue;
    }
    boardState[i] = playerSymbol;
    const score = minimax(boardState, true, depth + 1, alpha, beta);
    boardState[i] = "";
    bestScore = Math.min(bestScore, score);
    beta = Math.min(beta, score);
    if (beta <= alpha) {
      break;
    }
  }
  return bestScore;
}

function getBestMove() {
  let bestScore = -Infinity;
  let move = -1;

  for (let i = 0; i < board.length; i += 1) {
    if (board[i] !== "") {
      continue;
    }

    board[i] = aiSymbol;
    const score = minimax(board, false, 0, -Infinity, Infinity);
    board[i] = "";

    if (score > bestScore) {
      bestScore = score;
      move = i;
    }
  }

  return move;
}

function handleResult() {
  const result = getWinner(board);
  if (result) {
    finishGame(result);
    return true;
  }
  return false;
}

function aiMove() {
  if (!gameActive) {
    return;
  }

  const move = getBestMove();
  if (move === -1) {
    return;
  }

  board[move] = aiSymbol;
  playToneSequence([{ frequency: 540, duration: 0.09, type: "square" }]);
  setStatus(`AI places ${aiSymbol}.`);
  if (handleResult()) {
    return;
  }

  switchTurn();
  renderBoard();
  setStatus(`Your turn. Place ${playerSymbol}.`);
}

function startGame() {
  board = Array(9).fill("");
  gameActive = true;
  currentTurn = "X";
  updateLabels();
  renderBoard();

  if (playerSymbol === "X") {
    setStatus("Your turn. Place X to begin.");
    return;
  }

  setStatus("AI opens with perfect play.");
  renderBoard();
  window.setTimeout(() => {
    aiMove();
  }, 320);
}

function handleCellClick(event) {
  const index = Number(event.currentTarget.dataset.index);
  if (!gameActive || currentTurn !== playerSymbol || board[index] !== "") {
    return;
  }

  board[index] = playerSymbol;
  playToneSequence([{ frequency: 720, duration: 0.09, type: "triangle" }]);
  renderBoard();

  if (handleResult()) {
    return;
  }

  switchTurn();
  setStatus("AI is evaluating the board...");
  renderBoard();
  window.setTimeout(() => {
    aiMove();
  }, 280);
}

cells.forEach((cell) => {
  cell.addEventListener("click", handleCellClick);
});

choiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    choiceButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    playerSymbol = button.dataset.symbol;
    aiSymbol = playerSymbol === "X" ? "O" : "X";
    startGame();
  });
});

resetButton.addEventListener("click", startGame);
soundButton.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundButton.setAttribute("aria-pressed", String(soundEnabled));
  soundButton.textContent = soundEnabled ? "Sound: On" : "Sound: Off";
});

updateScoreboard();
startGame();
