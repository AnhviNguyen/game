// Get the canvas element
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


canvas.width = 1500;
canvas.height = 800;

// Load images
const bird = new Image();
const bg = new Image();
const bottomPipe = new Image();
const topPipe = new Image();

bird.src = 'img/flappybird.png';
bg.src = 'img/flappybirdbg.png';
bottomPipe.src = 'img/bottompipe.png';
topPipe.src = 'img/toppipe.png';

// Load audio
const bgMusic = new Audio('audio/bgm_mario.mp3');
const flapSound = new Audio('audio/sfx_wing.wav');
const pointSound = new Audio('audio/sfx_point.wav');
const hitSound = new Audio('audio/sfx_hit.wav');
const dieSound = new Audio('audio/sfx_die.wav');
const swooshSound = new Audio('audio/sfx_swooshing.wav');

// Game variables
let birdX = 50;
let birdY = canvas.height / 2;
let gravity = 0.25;
let velocity = 0;
let jump = -6;
let score = 0;
let gameOver = false;
let pipes = [];
const pipeGap = 250;
const pipeInterval = 2000; 
let lastPipe = 0;


const birdSprites = [];
for (let i = 0; i < 4; i++) {
    const img = new Image();
    img.src = `img/flappybird${i}.png`;
    birdSprites.push(img);
}
let currentFrame = 0;
let frameCount = 0;

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !gameOver) {
        velocity = jump;
        flapSound.play();
    }
    if (e.code === 'Space' && gameOver) {
        resetGame();
    }
});

document.addEventListener('click', () => {
    if (!gameOver) {
        velocity = jump;
        flapSound.play();
    } else {
        resetGame();
    }
});


function resetGame() {
    birdY = canvas.height / 2;
    velocity = 0;
    pipes = [];
    score = 0;
    gameOver = false;
    bgMusic.currentTime = 0;
    bgMusic.play();
}

function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: height,
        passed: false
    });
}


function gameLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    
    if (!gameOver) {
        // Create new pipes
        if (!lastPipe || timestamp - lastPipe >= pipeInterval) {
            createPipe();
            lastPipe = timestamp;
        }
        
        // Update bird position
        velocity += gravity;
        birdY += velocity;
        
        // Animate bird
        frameCount++;
        if (frameCount % 10 === 0) {
            currentFrame = (currentFrame + 1) % birdSprites.length;
        }
    }
    
    // Draw pipes and check collision
    pipes.forEach((pipe, index) => {
        // Move pipes
        if (!gameOver) {
            pipe.x -= 2;
        }
        
        // Draw pipes
        ctx.drawImage(topPipe, pipe.x, 0, 52, pipe.topHeight);
        ctx.drawImage(bottomPipe, pipe.x, pipe.topHeight + pipeGap, 52, canvas.height - pipe.topHeight - pipeGap);
        
        // Check collision
        if (!gameOver) {
            if (birdX + 34 > pipe.x && birdX < pipe.x + 52) {
                if (birdY < pipe.topHeight || birdY + 24 > pipe.topHeight + pipeGap) {
                    hitSound.play();
                    dieSound.play();
                    gameOver = true;
                    bgMusic.pause();
                }
            }
            
            // Score points
            if (!pipe.passed && birdX > pipe.x + 52) {
                score++;
                pipe.passed = true;
                pointSound.play();
            }
        }
        
        // Remove off-screen pipes
        if (pipe.x < -52) {
            pipes.splice(index, 1);
        }
    });
    
    // Draw bird
    ctx.save();
    ctx.translate(birdX + 17, birdY + 12);
    ctx.rotate(Math.min(Math.max(velocity * 0.05, -0.5), 0.5));
    ctx.drawImage(birdSprites[currentFrame], -17, -12, 34, 24);
    ctx.restore();
    
    // Check boundaries
    if (birdY < 0 || birdY + 24 > canvas.height) {
        if (!gameOver) {
            hitSound.play();
            dieSound.play();
            gameOver = true;
            bgMusic.pause();
        }
    }
    
    // Draw score
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.font = '30px Arial';
    ctx.strokeText(score, canvas.width / 2 - 10, 50);
    ctx.fillText(score, canvas.width / 2 - 10, 50);
    
    // Game over screen
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over!', canvas.width / 2 - 100, canvas.height / 2 - 50);
        ctx.font = '20px Arial';
        ctx.fillText('Click or press Space to restart', canvas.width / 2 - 100, canvas.height / 2 + 20);
    }
    
    requestAnimationFrame(gameLoop);
}

// Start background music and game
window.onload = () => {
    bgMusic.loop = true;
    bgMusic.play();
    requestAnimationFrame(gameLoop);
};