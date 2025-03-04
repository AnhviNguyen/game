import { Enemy } from "./enemy.js";
import { LevelManager } from "./levelManager.js";
import { Pipe } from "./pipe.js";
import { Player } from "./player.js";

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

        this.player = new Player(canvas, flapSound);
        this.pipes = [];
        this.enemyBirds = [];
        this.levelManager = new LevelManager(canvas, levelConfig, bg, swooshSound);
        this.score = 0;
        this.highScore = 0;
        this.gameOver = false;
        this.lastPipe = 0;
        this.levelTransitionDuration = 2000;

    }



    reset() {
        this.player.reset();
        this.pipes = [];
        this.enemyBirds = [];
        this.score = 0;
        this.lastPipe = 0;
        this.levelManager.currentLevel = 1;
        this.bg.src = 'img/background1.jpg';
        this.gameOver = false;
        this.levelManager.showLevelUp = false;
        this.bgMusic.currentTime = 0;
        this.bgMusic.play();

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



            if (!this.lastPipe || timestamp - this.lastPipe >= config.pipeInterval) {
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

        }

    }



    checkCollisions() {
        this.pipes.forEach(pipe => {
            if (!this.gameOver) {
                if (this.player.x + 34 > pipe.x && this.player.x < pipe.x + 52) {
                    if (this.player.y < pipe.topHeight || this.player.y + 24 > pipe.topHeight + pipe.pipeGap) {
                        this.hitSound.play();
                        this.dieSound.play();
                        this.gameOver = true;
                        this.bgMusic.pause();
                        this.highScore = Math.max(this.highScore, this.score);
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
                this.dieSound.play();
                this.gameOver = true;
                this.bgMusic.pause();
                this.highScore = Math.max(this.highScore, this.score);
            }
        });



        if (this.player.y < 0 || this.player.y + 24 > this.canvas.height) {
            if (!this.gameOver) {
                this.hitSound.play();
                this.dieSound.play();
                this.gameOver = true;
                this.bgMusic.pause();
                this.highScore = Math.max(this.highScore, this.score);

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
            ctx.fillRect(barX, barY, barWidth, barHeight);

            // Draw the filled part of the progress bar
            ctx.fillStyle = 'green';
            ctx.fillRect(barX, barY, barWidth * progress, barHeight);

            // Draw the border of the progress bar
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.strokeRect(barX, barY, barWidth, barHeight);

            // Draw the text above the progress bar
            ctx.fillStyle = 'white';
            ctx.fillText(`Next Level: ${this.score}/${nextRequired}`, barX, barY - 10);
        }

    }

    drawLevelInfo(ctx) {
        ctx.font = '20px "Press Start 2P", cursive';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.fillText(`Level: ${this.levelManager.currentLevel}`, 20, 30);
        ctx.fillText(`High Score: ${this.highScore}`, this.canvas.width - 150, 30);
    }
}
