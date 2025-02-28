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

        this.pipes.forEach(pipe => pipe.draw(ctx, this.topPipe, this.bottomPipe, this.canvas.height));
        this.enemyBirds.forEach(enemy => enemy.draw(ctx, this.enemies));
        this.player.draw(ctx);
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.font = '30px Arial';
        ctx.strokeText(this.score, this.canvas.width / 2 - 10, 50);
        ctx.fillText(this.score, this.canvas.width / 2 - 10, 50);
        this.drawLevelInfo(ctx);
        this.levelManager.drawLevelUpMessage(ctx, timestamp);



        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = '40px Arial';
            ctx.fillText('Game Over!', this.canvas.width / 2 - 100, this.canvas.height / 2 - 80);
            ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2 - 100, this.canvas.height / 2 - 20);
            ctx.fillText(`Level Reached: ${this.levelManager.currentLevel}`, this.canvas.width / 2 - 100, this.canvas.height / 2 + 40);
            ctx.font = '20px Arial';
            ctx.fillText('Click or press Space to restart', this.canvas.width / 2 - 100, this.canvas.height / 2 + 100);

        }
    }



    drawLevelInfo(ctx) {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.font = '20px Arial';
        ctx.strokeText(`Level: ${this.levelManager.currentLevel}`, 20, 30);
        ctx.fillText(`Level: ${this.levelManager.currentLevel}`, 20, 30);

        if (this.levelManager.currentLevel < 5) {
            const nextRequired = this.levelConfig[this.levelManager.currentLevel].requiredScore;
            ctx.strokeText(`Next Level: ${this.score}/${nextRequired}`, 20, 60);
            ctx.fillText(`Next Level: ${this.score}/${nextRequired}`, 20, 60);
        }
        ctx.strokeText(`High Score: ${this.highScore}`, this.canvas.width - 150, 30);
        ctx.fillText(`High Score: ${this.highScore}`, this.canvas.width - 150, 30);
    }
}
