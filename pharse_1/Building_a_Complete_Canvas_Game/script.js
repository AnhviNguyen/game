import { Game } from "./class/game.js";

/**
 * Flappy Bird Game - Main Script
 * Handles game initialization, UI interactions, and game loop
 */

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Start screen elements
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const optionButton = document.getElementById('optionButton');
const exitButton = document.getElementById('exitButton');
const boxButton = document.querySelector('.box-button');

// Options panel elements
const optionsContainer = document.querySelector('.options-container');
const closeBtn = document.querySelector('.close-btn');
const resetBtn = document.querySelector('.reset-btn');
const musicToggle = document.querySelector('.sound-option:nth-child(2) input');
const sfxToggle = document.querySelector('.sound-option:nth-child(3) input');
const highScoreText = document.querySelector('.high-score-text');

// Settings and game over panels
const settingsPanel = document.getElementById('settingsPanel');
const gameOverPanel = document.getElementById('gameOverPanel');
const restartButton = document.getElementById('restartButton');
const continueButton = document.getElementById('continueButton');
const settingsOptionButton = document.getElementById('settingsOptionButton');
const mainMenuButton = document.getElementById('mainMenuButton');
const restartButtonGameOver = document.getElementById('restartButtonGameOver');
const mainMenuButtonGameOver = document.getElementById('mainMenuButtonGameOver');
const finalScore = document.getElementById('finalScore');
const finalHighScore = document.getElementById('finalHighScore');

// Canvas dimensions
canvas.width = 1200;
canvas.height = 600;

// Load game assets
// Images
const bg = new Image();
const topPipe = new Image();
const bottomPipe = new Image();
const enemies = new Image();
const heartImage = new Image();

bg.src = 'img/background1.jpg';
topPipe.src = 'img/toppipe.png';
bottomPipe.src = 'img/bottompipe.png';
enemies.src = 'img/redbird.png';
heartImage.src = 'img/heart.png';

// Audio
const bgMusic = new Audio('audio/bgm_mario.mp3');
const flapSound = new Audio('audio/sfx_wing.wav');
const pointSound = new Audio('audio/sfx_point.wav');
const hitSound = new Audio('audio/sfx_hit.wav');
const dieSound = new Audio('audio/sfx_die.wav');
const swooshSound = new Audio('audio/sfx_swooshing.wav');

// Level configuration
const levelConfig = {
    1: { pipeSpeed: 1.5, pipeInterval: 3000, gravity: 0.2, pipeGap: 240, requiredScore: 5, pipeOscillation: 0 },
    2: { pipeSpeed: 2, pipeInterval: 2600, gravity: 0.25, pipeGap: 200, requiredScore: 10, pipeOscillation: 0 },
    3: { pipeSpeed: 2.5, pipeInterval: 2200, gravity: 0.28, pipeGap: 160, requiredScore: 15, pipeOscillation: 1 },
    4: { pipeSpeed: 3, pipeInterval: 1800, gravity: 0.3, pipeGap: 120, requiredScore: 20, pipeOscillation: 1.5 },
    5: { pipeSpeed: 3.5, pipeInterval: 1400, gravity: 0.32, pipeGap: 100, requiredScore: 25, pipeOscillation: 2 },
    6: { pipeSpeed: 4, pipeInterval: 1100, gravity: 0.35, pipeGap: 80, requiredScore: 30, pipeOscillation: 2.3 }
};

// Game state variables
let game;
let startTime;
let highScore = localStorage.getItem('highScore') || 0;
let gameAnimationId; // Store the animation frame ID for pausing
let isPaused = false;

/**
 * Update high score display in UI
 */
function updateHighScoreDisplay() {
    highScoreText.textContent = `High Score: ${highScore}`;
    finalHighScore.textContent = highScore;
}

// Initialize high score display
updateHighScoreDisplay();

// Event listeners for buttons
// Start button
startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    canvas.style.display = 'block';
    startTime = Date.now();
    game = new Game(canvas, levelConfig, bg, topPipe, bottomPipe, enemies, bgMusic, flapSound, pointSound, hitSound, dieSound, swooshSound);
    canvas.gameInstance = game; 
    bgMusic.loop = true;
    if (!musicToggle.checked) {
        bgMusic.muted = true;
    } else {
        bgMusic.muted = false;
    }
    bgMusic.play();
    isPaused = false;
    gameAnimationId = requestAnimationFrame(gameLoop);
});

// Options button
optionButton.addEventListener('click', () => {
    boxButton.style.display = 'none';
    optionsContainer.style.display = 'block';
    updateHighScoreDisplay();
});

// Close options button
closeBtn.addEventListener('click', () => {
    optionsContainer.style.display = 'none';
    boxButton.style.display = 'flex';
});

// Reset high score button
resetBtn.addEventListener('click', () => {
    highScore = 0;
    localStorage.setItem('highScore', highScore);
    updateHighScoreDisplay();
});

// Exit button
exitButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to exit the game?')) {
        window.close(); // Note: This may not work in all browsers due to security restrictions
        // Fallback for browsers that don't allow window.close()
        window.location.href = 'about:blank';
    }
});

// Music toggle
musicToggle.addEventListener('change', () => {
    bgMusic.muted = !musicToggle.checked;
});

// SFX toggle
sfxToggle.addEventListener('change', () => {
    flapSound.muted = !sfxToggle.checked;
    pointSound.muted = !sfxToggle.checked;
    hitSound.muted = !sfxToggle.checked;
    dieSound.muted = !sfxToggle.checked;
    swooshSound.muted = !sfxToggle.checked;
});

// Settings panel buttons
// Restart button
restartButton.addEventListener('click', () => {
    settingsPanel.style.display = 'none';
    gameOverPanel.style.display = 'none';
    if (game) {
        game.reset();
        isPaused = false;
        gameAnimationId = requestAnimationFrame(gameLoop);
    }
});

// Continue button
continueButton.addEventListener('click', () => {
    settingsPanel.style.display = 'none';
    isPaused = false;
    gameAnimationId = requestAnimationFrame(gameLoop);
});

// Settings options button
settingsOptionButton.addEventListener('click', () => {
    // Show options within the settings panel
    updateHighScoreDisplay();
    optionsContainer.style.display = 'block';
    // Center it in the settings panel
    settingsPanel.appendChild(optionsContainer);
    
    // Modify the close button to return to settings panel
    closeBtn.addEventListener('click', function tempListener() {
        optionsContainer.style.display = 'none';
        closeBtn.removeEventListener('click', tempListener);
        // Re-add the original event listener
        closeBtn.addEventListener('click', () => {
            optionsContainer.style.display = 'none';
            boxButton.style.display = 'flex';
        });
    });
});

// Main menu button
mainMenuButton.addEventListener('click', () => {
    returnToMainMenu();
});

// Game over panel buttons
// Restart button
restartButtonGameOver.addEventListener('click', () => {
    gameOverPanel.style.display = 'none';
    if (game) {
        game.reset();
        isPaused = false;
        gameAnimationId = requestAnimationFrame(gameLoop);
    }
});

// Main menu button
mainMenuButtonGameOver.addEventListener('click', () => {
    returnToMainMenu();
});

/**
 * Return to the main menu from game
 */
function returnToMainMenu() {
    // Cancel animation frame
    cancelAnimationFrame(gameAnimationId);
    
    // Hide all panels and ensure game over panel is completely hidden
    settingsPanel.style.display = 'none';
    gameOverPanel.style.display = 'none';
    canvas.style.display = 'none';
    
    // Reset options container position if it was moved
    document.body.appendChild(optionsContainer);
    optionsContainer.style.display = 'none';
    
    // Show start screen
    startScreen.style.display = 'flex';
    boxButton.style.display = 'flex';
    
    // Stop background music
    bgMusic.pause();
    bgMusic.currentTime = 0;
    
    isPaused = false;
    
    // Ensure game is reset when returning to main menu
    if (game) {
        game = null;
    }
}

// Event listener for pause/resume with Escape key
document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && game && !game.gameOver) {
        togglePause();
    }
    
    if (e.code === 'Space' && game && !game.gameOver && !isPaused) {
        if (!sfxToggle.checked) {
            flapSound.muted = true;
        } else {
            flapSound.muted = false;
        }
        game.player.flap();
    }
    
    if (e.code === 'Space' && game && game.gameOver) {
        game.reset();
        isPaused = false;
        gameAnimationId = requestAnimationFrame(gameLoop);
    }
    
    // Up arrow or W key for vertical movement
    if ((e.code === 'ArrowUp' || e.code === 'KeyW') && game && !game.gameOver && !isPaused) {
        game.player.moveUp();
    }
    
    // Down arrow or S key for vertical movement
    if ((e.code === 'ArrowDown' || e.code === 'KeyS') && game && !game.gameOver && !isPaused) {
        game.player.moveDown();
    }
});

// Add continuous movement for arrow keys
const keysPressed = {};

document.addEventListener('keydown', (e) => {
    keysPressed[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keysPressed[e.code] = false;
});

// Function to handle continuous movement
function handleContinuousMovement() {
    if (game && !game.gameOver && !isPaused && game.player.hasPointerPowerUp) {
        if (keysPressed['ArrowUp'] || keysPressed['KeyW']) {
            game.player.moveUp();
        }
        if (keysPressed['ArrowDown'] || keysPressed['KeyS']) {
            game.player.moveDown();
        }
    }
}

/**
 * Toggle game pause state
 */
function togglePause() {
    if (isPaused) {
        // Resume game
        settingsPanel.style.display = 'none';
        isPaused = false;
        gameAnimationId = requestAnimationFrame(gameLoop);
    } else {
        // Pause game
        cancelAnimationFrame(gameAnimationId);
        isPaused = true;
        settingsPanel.style.display = 'flex';
    }
}

// Event listener for mouse click to flap
document.addEventListener('click', () => {
    if (game && !game.gameOver && !isPaused) {
        if (!sfxToggle.checked) {
            flapSound.muted = true;
        } else {
            flapSound.muted = false;
        }
        game.player.flap();
    } else if (game && game.gameOver) {
        // Don't auto-restart on click anymore, let the player use the game over panel
        showGameOverPanel();
    }
});

/**
 * Show game over panel with final score
 */
function showGameOverPanel() {
    finalScore.textContent = game.score;
    finalHighScore.textContent = highScore;
    gameOverPanel.style.display = 'flex';
}

/**
 * Main game loop
 * @param {number} timestamp - Current animation timestamp
 */
function gameLoop(timestamp) {
    if (game && !isPaused) {
        // Handle continuous movement for arrow keys
        handleContinuousMovement();
        
        game.update(timestamp);
        game.draw(ctx, timestamp);
        
        // Update high score if current score is higher
        if (game.score > highScore) {
            highScore = game.score;
            localStorage.setItem('highScore', highScore);
            updateHighScoreDisplay();
        }
        
        // Check if game is over
        if (game.gameOver) {
            showGameOverPanel();
            return; // Stop the animation loop
        }
        
        gameAnimationId = requestAnimationFrame(gameLoop);
    }
}

/**
 * Add a pause button to the canvas
 */
function addPauseButton() {
    const pauseButton = document.createElement('button');
    pauseButton.id = 'pauseButton';
    pauseButton.className = 'pause-button';
    pauseButton.innerHTML = '❚❚';
    pauseButton.title = 'Pause Game (Esc)';
    document.body.appendChild(pauseButton);
    
    pauseButton.addEventListener('click', togglePause);
    
    // Only show the pause button when the game is active
    const checkGameState = setInterval(() => {
        if (canvas.style.display === 'block' && !game?.gameOver) {
            pauseButton.style.display = 'block';
        } else {
            pauseButton.style.display = 'none';
        }
    }, 100);
}

// Call this function after the page loads
window.addEventListener('load', addPauseButton);

// Add some extra CSS for the pause button
const pauseButtonStyle = document.createElement('style');
pauseButtonStyle.innerHTML = `
    .pause-button {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        font-size: 24px;
        border: 2px solid white;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        z-index: 100;
        transition: background-color 0.2s;
    }
    
    .pause-button:hover {
        background-color: rgba(0, 0, 0, 0.8);
    }
`;
document.head.appendChild(pauseButtonStyle);