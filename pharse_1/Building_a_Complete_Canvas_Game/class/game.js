import { Enemy } from "./enemy.js";
import { LevelManager } from "./levelManager.js";
import { Pipe } from "./pipe.js";
import { Player } from "./player.js";
import { Heart } from './heart.js';
import { Speech } from './speech.js';

export class Game {

    constructor(canvas, levelConfig, bg, topPipe, bottomPipe, enemies, bgMusic, flapSound, pointSound, hitSound, dieSound, swooshSound) {
        this.canvas = canvas;
        this.levelConfig = levelConfig;
        this.bg = bg;
        this.topPipe = topPipe;
        this.bottomPipe = bottomPipe;
        this.enemies = enemies;
        this.bgMusic = bgMusic;
        this.flapSound = flapSound;
        this.pointSound = pointSound;
        this.hitSound = hitSound;
        this.dieSound = dieSound;
        this.swooshSound = swooshSound;
        this.lastLostLevel = 1;

        this.player = new Player(canvas, flapSound);
        this.pipes = [];
        this.enemyBirds = [];
        this.levelManager = new LevelManager(canvas, levelConfig, bg, swooshSound);
        this.score = 0;
        this.highScore = 0;
        this.gameOver = false;
        this.lastPipe = 0;
        this.levelTransitionDuration = 1000;
        this.hearts = [];
        this.lives = 1; // Starting number of lives
        this.heart = new Heart();
        this.speeches = [];
        this.speech = new Speech();
        this.isSpeechActive = false; // Trạng thái hiệu ứng Speech
        this.speechEffectStartTime = null; // Thời gian bắt đầu hiệu ứng

        this.updateBackground();

    }

    updateBackground() {
        if (this.levelManager.currentLevel - 1 < this.levelManager.backgroundImages.length) {
            this.bg.src = this.levelManager.backgroundImages[this.levelManager.currentLevel - 1];
        }
    }



    reset() {
        this.player.reset();
        this.pipes = [];
        this.enemyBirds = [];
        this.score = 0;
        this.lastPipe = 0;
        this.levelManager.currentLevel = 1; // Reset về level 1 khi reset hoàn toàn
        this.lastLostLevel = 1; // Reset level mất mạng về 1
        this.updateBackground(); // Cập nhật background theo level 1
        this.gameOver = false;
        this.levelManager.showLevelUp = false;
        this.bgMusic.currentTime = 0;
        this.bgMusic.play();
        this.lives = 1; // Reset số mạng ban đầu
        this.hearts = [];
        this.speeches = [];
    }


    createPipe() {
        const config = this.levelManager.getCurrentConfig();
        const minHeight = 50;
        const maxHeight = this.canvas.height - config.pipeGap - minHeight;
        const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        this.pipes.push(new Pipe(this.canvas.width, height, config.pipeGap, Math.random() * Math.PI * 2));

    }



    createEnemyBird() {
        const yPosition = Math.random() * this.canvas.height;
        this.enemyBirds.push(new Enemy(this.canvas.width + 100, yPosition, 5));

    }



    update(timestamp) {
        const config = this.levelManager.getCurrentConfig();
        if (!this.gameOver && !this.levelManager.isLevelTransition) {
            this.player.update(config.gravity);

            const randomOffset = Math.random() * 500;
            if (!this.lastPipe || timestamp - this.lastPipe >= config.pipeInterval + randomOffset) {
                this.createPipe();
                if (Math.random() < 0.8) {
                    this.createEnemyBird();
                }
                this.lastPipe = timestamp;
            }

            this.pipes.forEach((pipe, index) => {
                pipe.update(config.pipeSpeed, timestamp, config.pipeOscillation);
                if (pipe.isOffScreen()) {
                    this.pipes.splice(index, 1);
                }
            });

            this.enemyBirds.forEach((enemy, index) => {
                enemy.update();
                if (enemy.isOffScreen()) {
                    this.enemyBirds.splice(index, 1);
                }
            });

            this.checkCollisions();
            this.levelManager.checkLevelUp(this.score, timestamp);

            // Move hearts with the screen
            this.hearts.forEach((heart, index) => {
                heart.x -= config.pipeSpeed;
                if (heart.x < -20) {
                    this.hearts.splice(index, 1);
                }
            });

            // Randomly create hearts
            if (Math.random() < 0.0009) {
                this.createHeart();
            }

            this.checkHeartCollisions();

            // Move speeches with the screen
            this.speeches.forEach((speech, index) => {
                speech.x -= config.pipeSpeed;
                if (speech.x < -20) {
                    this.speeches.splice(index, 1);
                }
            });

            // Randomly create speeches
            if (Math.random() < 0.0005) {
                this.createSpeech();
            }

            this.checkSpeechCollisions();
        }

        if (this.lives < 0) {
            this.lives = 0;
        }

        if (this.lives > 0) {
            return; // Continue the game
        }

        if (this.levelManager.isLevelTransition) {
            this.lastPipe = timestamp;
        }
    }



    checkCollisions() {
        if (this.isSpeechActive) {
            return; // Bỏ qua tất cả va chạm khi hiệu ứng Speech đang hoạt động
        }

        this.pipes.forEach(pipe => {
            if (!this.gameOver) {
                if (this.player.x + 34 > pipe.x && this.player.x < pipe.x + 52) {
                    if (this.player.y < pipe.topHeight || this.player.y + 24 > pipe.topHeight + pipe.pipeGap) {
                        this.hitSound.play();
                        this.lives--;
                        this.lastLostLevel = this.levelManager.currentLevel;
                        if (this.lives > 0) {
                            this.resetCurrentLevel();
                        } else {
                            this.dieSound.play();
                            this.gameOver = true;
                            this.bgMusic.pause();
                            this.highScore = Math.max(this.highScore, this.score);
                        }
                    }
                }

                if (!pipe.passed && this.player.x > pipe.x + 52) {
                    this.score++;
                    pipe.passed = true;
                    this.pointSound.play();
                }
            }
        });

        this.enemyBirds.forEach(enemy => {
            if (this.player.x < enemy.x + enemy.width && this.player.x + 34 > enemy.x &&
                this.player.y < enemy.y + enemy.height && this.player.y + 24 > enemy.y) {
                this.hitSound.play();
                this.lives--;
                this.lastLostLevel = this.levelManager.currentLevel;
                if (this.lives > 0) {
                    this.resetCurrentLevel();
                } else {
                    this.dieSound.play();
                    this.gameOver = true;
                    this.bgMusic.pause();
                    this.highScore = Math.max(this.highScore, this.score);
                }
            }
        });

        // Check collision with top/bottom edges of the canvas
        if (this.player.y < 0 || this.player.y + 24 > this.canvas.height) {
            if (!this.gameOver) {
                this.hitSound.play();
                this.lives--;
                this.lastLostLevel = this.levelManager.currentLevel; // Lưu level mà người chơi mất mạng
                if (this.lives > 0) {
                    this.resetCurrentLevel(); // Reset nhưng giữ level hiện tại
                } else {
                    this.dieSound.play();
                    this.gameOver = true;
                    this.bgMusic.pause();
                    this.highScore = Math.max(this.highScore, this.score);
                }
            }
        }
    }


    draw(ctx, timestamp) {
        ctx.imageSmoothingEnabled = false; // Disable image smoothing for a pixelated effect
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.drawImage(this.bg, 0, 0, this.canvas.width, this.canvas.height);

        if (this.levelManager.isLevelTransition) {
            const elapsedTime = timestamp - this.levelManager.levelTransitionStartTime;
            this.player.y = this.canvas.height / 2 + Math.sin(elapsedTime / 200) * 10;
            this.player.draw(ctx);
            this.levelManager.drawLevelUpMessage(ctx, timestamp);
            this.drawLevelInfo(ctx);

            if (elapsedTime > this.levelTransitionDuration) {
                this.levelManager.isLevelTransition = false;
                this.levelManager.showLevelUp = false;
                this.levelManager.currentLevel++;
                this.levelManager.updateBackground();
            }
            return;
        }

        // Draw pipes with a pixelated style
        this.pipes.forEach(pipe => pipe.draw(ctx, this.topPipe, this.bottomPipe, this.canvas.height));

        // Draw enemy birds with a pixelated style
        this.enemyBirds.forEach(enemy => enemy.draw(ctx, this.enemies));

        // Draw player with a pixelated style
        this.player.draw(ctx);

        // Draw score with a retro font style
        ctx.fillStyle = 'white';
        ctx.lineWidth = 2;
        ctx.font = '30px "Press Start 2P", cursive';
        ctx.strokeText(this.score, this.canvas.width / 2 - 10, 50);
        ctx.fillText(this.score, this.canvas.width / 2 - 10, 50);

        // Draw level info with a retro font style
        this.drawLevelInfo(ctx);
        this.levelManager.drawLevelUpMessage(ctx, timestamp);

        // Draw progress bar for next level
        if (this.levelManager.currentLevel < 5) {
            const nextRequired = this.levelConfig[this.levelManager.currentLevel].requiredScore;
            const progress = Math.min(this.score / nextRequired, 1);
            const barWidth = 200;
            const barHeight = 20;
            const barX = 20;
            const barY = 70;

            // Draw the background of the progress bar
            ctx.fillStyle = 'black';
            ctx.fillRect(barX +130, barY -15, barWidth, barHeight);

            // Draw the filled part of the progress bar
            ctx.fillStyle = 'green';
            ctx.fillRect(barX +130, barY -15, barWidth * progress, barHeight);

            // Draw the border of the progress bar
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.strokeRect(barX +130, barY -15, barWidth, barHeight);

            // Draw the text above the progress bar
            ctx.fillStyle = 'white';
            ctx.fillText(`Next Level: `, barX, barY );
        }

        // Draw hearts
        this.hearts.forEach(heart => {
            this.heart.draw(ctx, heart.x, heart.y);
        });

        // Draw lives and progress bar
        ctx.fillStyle = 'white';
        ctx.font = '20px "Press Start 2P", cursive';
        ctx.fillText(`Lives:`, 20, 100);

        const barWidth = 200;
        const barHeight = 20;
        const barX = 20;
        const barY = 90;
 
        ctx.fillStyle = 'black';
        ctx.fillRect(barX +130, barY, barWidth, barHeight);

        ctx.fillStyle = 'red';
        ctx.fillRect(barX +130, barY, barWidth * (this.lives / 3), barHeight);

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX +130, barY, barWidth, barHeight);

        // Draw speeches
        this.speeches.forEach(speech => {
            this.speech.draw(ctx, speech.x, speech.y);
        });
    }

    drawLevelInfo(ctx) {
        ctx.font = '20px "Press Start 2P", cursive';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.fillText(`Level: ${this.levelManager.currentLevel}`, 20, 30);
        ctx.fillText(`High Score: ${this.highScore}`, this.canvas.width - 150, 30);
    }

    createHeart() {
        const xPosition = Math.random() * (this.canvas.width - 50) + 25;
        const yPosition = Math.random() * (this.canvas.height - 50) + 25;
        this.hearts.push({ x: xPosition, y: yPosition });
    }

    checkHeartCollisions() {
        this.hearts.forEach((heart, index) => {
            if (this.player.x < heart.x + 20 && this.player.x + 34 > heart.x &&
                this.player.y < heart.y + 20 && this.player.y + 24 > heart.y) {
                this.hearts.splice(index, 1);
                this.lives++;
                // Play a sound or animation for collecting a heart
            }
        });
    }

    createSpeech() {
        const xPosition = Math.random() * (this.canvas.width - 50) + 25;
        const yPosition = Math.random() * (this.canvas.height - 50) + 25;
        this.speeches.push({ x: xPosition, y: yPosition });
    }

    checkSpeechCollisions() {
        this.speeches.forEach((speech, index) => {
            if (this.player.x < speech.x + 20 && this.player.x + 34 > speech.x &&
                this.player.y < speech.y + 20 && this.player.y + 24 > speech.y) {
                this.speeches.splice(index, 1);
                this.speech.applyEffect(this.player, this); // Truyền game vào để quản lý trạng thái
                // Thêm âm thanh khi thu thập (tùy chọn)
                if (!this.flapSound.muted) {
                    this.pointSound.play(); // Sử dụng pointSound hoặc thêm âm thanh mới
                }
            }
        });
    }

    resetLevel() {
        this.reset();
        this.levelManager.currentLevel = this.lastLostLevel; // Reset về level mất mạng gần nhất
        this.levelManager.updateBackground(); // Cập nhật background theo level
        this.bgMusic.currentTime = 0;
        this.bgMusic.play();
    }

    resetCurrentLevel() {
        this.player.reset();
        this.pipes = [];
        this.enemyBirds = [];
        this.lastPipe = 0;
        this.bg.src = this.levelManager.backgroundImages[this.levelManager.currentLevel - 1]; // Cập nhật background theo level hiện tại
        this.bgMusic.currentTime = 0;
        this.bgMusic.play();
    }
}
