import { Game } from "./class/game.js";

// Get the canvas element
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Get the start screen and buttons
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const optionButton = document.getElementById('optionButton');
const exitButton = document.getElementById('exitButton');
const boxButton = document.querySelector('.box-button');

// Get the options panel elements
const optionsContainer = document.querySelector('.options-container');
const closeBtn = document.querySelector('.close-btn');
const resetBtn = document.querySelector('.reset-btn');
const musicToggle = document.querySelector('.sound-option:nth-child(2) input');
const sfxToggle = document.querySelector('.sound-option:nth-child(3) input');
const highScoreText = document.querySelector('.high-score-text');

// Get the settings panel elements
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
let highScore = localStorage.getItem('highScore') || 0;
let gameAnimationId; // Store the animation frame ID for pausing
let isPaused = false;

// Update high score text
function updateHighScoreDisplay() {
    highScoreText.textContent = `High Score: ${highScore}`;
    finalHighScore.textContent = highScore;
}

// Initialize high score display
updateHighScoreDisplay();

// Event listeners for buttons
startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    canvas.style.display = 'block';
    startTime = Date.now();
    game = new Game(canvas, levelConfig, bg, topPipe, bottomPipe, enemies, bgMusic, flapSound, pointSound, hitSound, dieSound, swooshSound);
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

// Toggle between option button and options container
optionButton.addEventListener('click', () => {
    boxButton.style.display = 'none';
    optionsContainer.style.display = 'block';
    updateHighScoreDisplay();
});

// Close options and show buttons again
closeBtn.addEventListener('click', () => {
    optionsContainer.style.display = 'none';
    boxButton.style.display = 'flex';
});

// Reset high score
resetBtn.addEventListener('click', () => {
    highScore = 0;
    localStorage.setItem('highScore', highScore);
    updateHighScoreDisplay();
});

exitButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to exit the game?')) {
        window.close(); // Note: This may not work in all browsers due to security restrictions
        // Fallback for browsers that don't allow window.close()
        window.location.href = 'about:blank';
    }
});

// Music toggle functionality
musicToggle.addEventListener('change', () => {
    bgMusic.muted = !musicToggle.checked;
});

// SFX toggle functionality
sfxToggle.addEventListener('change', () => {
    flapSound.muted = !sfxToggle.checked;
    pointSound.muted = !sfxToggle.checked;
    hitSound.muted = !sfxToggle.checked;
    dieSound.muted = !sfxToggle.checked;
    swooshSound.muted = !sfxToggle.checked;
});

// Settings panel buttons
restartButton.addEventListener('click', () => {
    settingsPanel.style.display = 'none';
    gameOverPanel.style.display = 'none';
    if (game) {
        game.reset();
        isPaused = false;
        gameAnimationId = requestAnimationFrame(gameLoop);
    }
});

continueButton.addEventListener('click', () => {
    settingsPanel.style.display = 'none';
    isPaused = false;
    gameAnimationId = requestAnimationFrame(gameLoop);
});

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

mainMenuButton.addEventListener('click', () => {
    returnToMainMenu();
});

// Game over panel buttons
restartButtonGameOver.addEventListener('click', () => {
    gameOverPanel.style.display = 'none';
    if (game) {
        game.reset();
        isPaused = false;
        gameAnimationId = requestAnimationFrame(gameLoop);
    }
});

mainMenuButtonGameOver.addEventListener('click', () => {
    returnToMainMenu();
});


function returnToMainMenu() {
    // Hủy khung hình động
    cancelAnimationFrame(gameAnimationId);
    
    // Ẩn tất cả các bảng điều khiển và đảm bảo gameOverPanel được ẩn hoàn toàn
    settingsPanel.style.display = 'none';
    gameOverPanel.style.display = 'none';
    canvas.style.display = 'none';
    
    // Đặt lại vị trí của optionsContainer nếu nó đã bị di chuyển
    document.body.appendChild(optionsContainer);
    optionsContainer.style.display = 'none';
    
    // Hiển thị màn hình bắt đầu
    startScreen.style.display = 'flex';
    boxButton.style.display = 'flex';
    
    // Dừng nhạc nền
    bgMusic.pause();
    bgMusic.currentTime = 0;
    
    isPaused = false;
    
    // Đảm bảo game được reset khi quay lại main menu
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
});

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

// Function to show game over panel
function showGameOverPanel() {
    finalScore.textContent = game.score;
    finalHighScore.textContent = highScore;
    gameOverPanel.style.display = 'flex';
}

// Main game loop
function gameLoop(timestamp) {
    if (game && !isPaused) {
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

// Add a button to the canvas for pausing
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