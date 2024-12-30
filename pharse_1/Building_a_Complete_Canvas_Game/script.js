// Get the canvas element
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let isLevelTransition = false;
let levelTransitionStartTime = 0;
const levelTransitionDuration = 5000; // 3 seconds


canvas.width = 800;
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

// Level configurations
const levelConfig = {
    1: {
        pipeSpeed: 1.5, // Decreased from 2
        pipeInterval: 2500, // Increased from 2000
        gravity: 0.2, // Decreased from 0.25
        pipeGap: 280, // Increased from 250
        requiredScore: 5
    },
    2: {
        pipeSpeed: 2,
        pipeInterval: 2000,
        gravity: 0.25,
        pipeGap: 250,
        requiredScore: 10
    },
    3: {
        pipeSpeed: 2.5,
        pipeInterval: 1800,
        gravity: 0.28,
        pipeGap: 230,
        requiredScore: 15
    },
    4: {
        pipeSpeed: 3,
        pipeInterval: 1600,
        gravity: 0.3,
        pipeGap: 220,
        requiredScore: 20
    },
    5: {
        pipeSpeed: 3.5,
        pipeInterval: 1400,
        gravity: 0.32,
        pipeGap: 210,
        requiredScore: 25
    }
};

// Game variables
let birdX = 50;
let birdY = canvas.height / 2;
let velocity = 0;
let jump = -6;
let score = 0;
let gameOver = false;
let pipes = [];
let lastPipe = 0;
let currentLevel = 1;
let highScore = 0;

// Level up animation variables
let showLevelUp = false;
let levelUpTimer = 0;
const levelUpDuration = 2000; // 2 seconds
let levelUpStartTime = 0;

// Get current level configuration
function getCurrentConfig() {
    return levelConfig[currentLevel];
}

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
    currentLevel = 1;
    gameOver = false;
    showLevelUp = false;
    bgMusic.currentTime = 0;
    bgMusic.play();
}

function createPipe() {
    const config = getCurrentConfig();
    const minHeight = 50;
    const maxHeight = canvas.height - config.pipeGap - minHeight;
    const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: height,
        passed: false
    });
}

function checkLevelUp(timestamp) {
    if (currentLevel < 5) {
        const config = getCurrentConfig();
        if (score >= config.requiredScore && !showLevelUp && !isLevelTransition) {
            currentLevel++;
            showLevelUp = true;
            levelUpStartTime = timestamp;
            levelTransitionStartTime = timestamp; // Bắt đầu trạng thái chuyển cấp
            isLevelTransition = true;
            swooshSound.play();
        }
    }
}




function drawLevelUpMessage(timestamp) {
    if (!showLevelUp) return;

    const elapsedTime = timestamp - levelUpStartTime;
    if (elapsedTime > levelUpDuration) {
        showLevelUp = false;
        return;
    }

    // Calculate animation progress (0 to 1)
    const progress = elapsedTime / levelUpDuration;
    
    // Fade in and out effect
    let alpha = 1;
    if (progress < 0.2) {
        alpha = progress / 0.2; // Fade in
    } else if (progress > 0.8) {
        alpha = (1 - progress) / 0.2; // Fade out
    }

    // Scale effect
    const scale = 1 + Math.sin(progress * Math.PI) * 0.2;

    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.7})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    
    // Draw level up message
    ctx.font = 'bold 48px Arial';
    ctx.strokeText(`Level ${currentLevel}!`, 0, -20);
    ctx.fillText(`Level ${currentLevel}!`, 0, -20);
    
    ctx.font = '24px Arial';
    ctx.strokeText('Get ready for increased difficulty!', 0, 20);
    ctx.fillText('Get ready for increased difficulty!', 0, 20);

    ctx.restore();
}

function drawLevelInfo() {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.font = '20px Arial';
    
    // Draw level
    ctx.strokeText(`Level: ${currentLevel}`, 20, 30);
    ctx.fillText(`Level: ${currentLevel}`, 20, 30);
    
    // Draw next level requirement
    if (currentLevel < 5) {
        const nextRequired = levelConfig[currentLevel].requiredScore;
        ctx.strokeText(`Next Level: ${score}/${nextRequired}`, 20, 60);
        ctx.fillText(`Next Level: ${score}/${nextRequired}`, 20, 60);
    }
    
    // Draw high score
    ctx.strokeText(`High Score: ${highScore}`, canvas.width - 150, 30);
    ctx.fillText(`High Score: ${highScore}`, canvas.width - 150, 30);
}

function gameLoop(timestamp) {
    const config = getCurrentConfig();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    if (isLevelTransition) {
        const elapsedTime = timestamp - levelTransitionStartTime;

        // Bird lơ lửng với hiệu ứng lên xuống
        birdY = canvas.height / 2 + Math.sin(elapsedTime / 200) * 10;
    
        // Vẽ bird
        ctx.drawImage(birdSprites[currentFrame], birdX, birdY, 34, 24);
    
        // Hiển thị thông báo Level Up
        drawLevelUpMessage(timestamp); 
        drawLevelInfo(); 
    
        // Kết thúc trạng thái chuyển cấp sau 3 giây
        if (elapsedTime > levelTransitionDuration) {
            isLevelTransition = false;
            showLevelUp = false;
        }
    
        requestAnimationFrame(gameLoop);
        return; // Không xử lý các logic khác
    }
    
    if (!gameOver) {
        // Create new pipes
        if (!lastPipe || timestamp - lastPipe >= config.pipeInterval) {
            createPipe();
            lastPipe = timestamp;
        }
        
        // Update bird position
        velocity += config.gravity;
        birdY += velocity;
        
        // Animate bird
        frameCount++;
        if (frameCount % 10 === 0) {
            currentFrame = (currentFrame + 1) % birdSprites.length;
        }
        
        // Check for level up
        checkLevelUp(timestamp);
    }
    
    // Draw pipes and check collision
    pipes.forEach((pipe, index) => {
        // Move pipes
        if (!gameOver && !showLevelUp) {
            pipe.x -= config.pipeSpeed;
        }
        
        // Draw pipes
        ctx.drawImage(topPipe, pipe.x, 0, 52, pipe.topHeight);
        ctx.drawImage(bottomPipe, pipe.x, pipe.topHeight + config.pipeGap, 52, canvas.height - pipe.topHeight - config.pipeGap);
        
        // Check collision
        if (!gameOver) {
            if (birdX + 34 > pipe.x && birdX < pipe.x + 52) {
                if (birdY < pipe.topHeight || birdY + 24 > pipe.topHeight + config.pipeGap) {
                    hitSound.play();
                    dieSound.play();
                    gameOver = true;
                    bgMusic.pause();
                    highScore = Math.max(highScore, score);
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
            highScore = Math.max(highScore, score);
        }
    }
    
    // Draw score
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.font = '30px Arial';
    ctx.strokeText(score, canvas.width / 2 - 10, 50);
    ctx.fillText(score, canvas.width / 2 - 10, 50);
    
    // Draw level info
    drawLevelInfo();
    
    // Draw level up message if needed
    drawLevelUpMessage(timestamp);
    
    // Game over screen
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over!', canvas.width / 2 - 100, canvas.height / 2 - 80);
        ctx.fillText(`Score: ${score}`, canvas.width / 2 - 100, canvas.height / 2 - 20);
        ctx.fillText(`Level Reached: ${currentLevel}`, canvas.width / 2 - 100, canvas.height / 2 + 40);
        ctx.font = '20px Arial';
        ctx.fillText('Click or press Space to restart', canvas.width / 2 - 100, canvas.height / 2 + 100);
    }
    
    requestAnimationFrame(gameLoop);
}

// Start background music and game
window.onload = () => {
    bgMusic.loop = true;
    bgMusic.play();
    requestAnimationFrame(gameLoop);
};