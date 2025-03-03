import { Game } from "./class/game.js";

// Get the canvas element
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Get the start screen and buttons
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const optionButton = document.getElementById('optionButton');
const exitButton = document.getElementById('exitButton');

// Get the options panel and buttons
const optionsPanel = document.getElementById('optionsPanel');
const scoreTableBody = document.getElementById('scoreTableBody');
const muteButton = document.getElementById('muteButton');
const unmuteButton = document.getElementById('unmuteButton');
const closeOptionsButton = document.getElementById('closeOptionsButton');

canvas.width = 1200;
canvas.height = 600;

// Load images
const bg = new Image();
const topPipe = new Image();
const bottomPipe = new Image();
const enemies = new Image();

bg.src = 'img/background1.jpg';
topPipe.src = 'img/toppipe.png';
bottomPipe.src = 'img/bottompipe.png';
enemies.src = 'img/redbird.png';

// Load audio
const bgMusic = new Audio('audio/bgm_mario.mp3');
const flapSound = new Audio('audio/sfx_wing.wav');
const pointSound = new Audio('audio/sfx_point.wav');
const hitSound = new Audio('audio/sfx_hit.wav');
const dieSound = new Audio('audio/sfx_die.wav');
const swooshSound = new Audio('audio/sfx_swooshing.wav');

// Define levelConfig
const levelConfig = {
    1: { pipeSpeed: 1.5, pipeInterval: 2400, gravity: 0.2, pipeGap: 240, requiredScore: 5, pipeOscillation: 0 },
    2: { pipeSpeed: 2, pipeInterval: 2000, gravity: 0.25, pipeGap: 200, requiredScore: 10, pipeOscillation: 0 },
    3: { pipeSpeed: 2.5, pipeInterval: 1600, gravity: 0.28, pipeGap: 160, requiredScore: 15, pipeOscillation: 1 },
    4: { pipeSpeed: 3, pipeInterval: 1200, gravity: 0.3, pipeGap: 120, requiredScore: 20, pipeOscillation: 1.5 },
    5: { pipeSpeed: 3.5, pipeInterval: 800, gravity: 0.32, pipeGap: 100, requiredScore: 25, pipeOscillation: 2 }
};

// Initialize the game
let game;
let startTime;

// Event listeners for buttons
startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    canvas.style.display = 'block';
    startTime = Date.now();
    game = new Game(canvas, levelConfig, bg, topPipe, bottomPipe, enemies, bgMusic, flapSound, pointSound, hitSound, dieSound, swooshSound);
    bgMusic.loop = true;
    bgMusic.play();
    requestAnimationFrame(gameLoop);
});

optionButton.addEventListener('click', () => {
    updateScoreTable();
    optionsPanel.style.display = 'block';
});

exitButton.addEventListener('click', () => {
    window.close(); // Note: This may not work in all browsers due to security restrictions
});

muteButton.addEventListener('click', () => {
    bgMusic.muted = true;
    flapSound.muted = true;
    pointSound.muted = true;
    hitSound.muted = true;
    dieSound.muted = true;
    swooshSound.muted = true;
});

unmuteButton.addEventListener('click', () => {
    bgMusic.muted = false;
    flapSound.muted = false;
    pointSound.muted = false;
    hitSound.muted = false;
    dieSound.muted = false;
    swooshSound.muted = false;
});

closeOptionsButton.addEventListener('click', () => {
    optionsPanel.style.display = 'none';
});

// Event listeners for player input
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && game && !game.gameOver) {
        game.player.flap();
    }
    if (e.code === 'Space' && game && game.gameOver) {
        game.reset();
    }
});

document.addEventListener('click', () => {
    if (game && !game.gameOver) {
        game.player.flap();
    } else if (game && game.gameOver) {
        game.reset();
    }
});

// Main game loop
function gameLoop(timestamp) {
    if (game) {
        game.update(timestamp);
        game.draw(ctx, timestamp);
        requestAnimationFrame(gameLoop);
    }
}

// Function to update the score table
function updateScoreTable() {
    scoreTableBody.innerHTML = ''; // Clear existing entries
    const playtime = Math.floor((Date.now() - startTime) / 1000);
    const row = document.createElement('tr');
    const timeCell = document.createElement('td');
    const scoreCell = document.createElement('td');
    timeCell.textContent = playtime;
    scoreCell.textContent = game ? game.score : 0;
    row.appendChild(timeCell);
    row.appendChild(scoreCell);
    scoreTableBody.appendChild(row);
}

