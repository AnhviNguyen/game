import { Enemy } from "./enemy.js";
import { LevelManager } from "../manager/levelManager.js";
import { Pipe } from "./pipe.js";
import { Player } from "./player.js";
import { Heart } from './heart.js';
import { Speech } from './speech.js';
import { Clone } from './clone.js';
import { Pointer } from './pointer.js';
import { PowerUpManager } from '../manager/powerUpManager.js';
import { CollisionManager } from '../manager/collisionManager.js';
import { UIManager } from '../manager/uiManager.js';
import { ObstacleManager } from '../manager/obstacleManager.js';
import { CloneManager } from '../manager/cloneManager.js';

/**
 * Main Game class that handles game logic, collisions, and rendering
 */
export class Game {
    /**
     * Initialize the game with all required assets and configurations
     * @param {HTMLCanvasElement} canvas - The game canvas
     * @param {Object} levelConfig - Configuration for different game levels
     * @param {Image} bg - Background image
     * @param {Image} topPipe - Top pipe image
     * @param {Image} bottomPipe - Bottom pipe image
     * @param {Image} enemies - Enemy bird image
     * @param {Audio} bgMusic - Background music
     * @param {Audio} flapSound - Wing flap sound
     * @param {Audio} pointSound - Point scoring sound
     * @param {Audio} hitSound - Collision sound
     * @param {Audio} dieSound - Death sound
     * @param {Audio} swooshSound - Level transition sound
     */
    constructor(canvas, levelConfig, bg, topPipe, bottomPipe, enemies, bgMusic, flapSound, pointSound, hitSound, dieSound, swooshSound) {
        // Canvas and assets
        this.canvas = canvas;
        this.levelConfig = levelConfig;
        this.bg = bg;
        this.topPipe = topPipe;
        this.bottomPipe = bottomPipe;
        this.enemies = enemies;
        
        // Audio
        this.bgMusic = bgMusic;
        this.flapSound = flapSound;
        this.pointSound = pointSound;
        this.hitSound = hitSound;
        this.dieSound = dieSound;
        this.swooshSound = swooshSound;
        
        // Game state
        this.lastLostLevel = 1;
        this.score = 0;
        this.highScore = 0;
        this.gameOver = false;
        this.lastPipe = 0;
        this.levelTransitionDuration = 1000;
        this.lives = 1;
        
        // Game objects
        this.player = new Player(canvas, flapSound);
        this.pipes = [];
        this.enemyBirds = [];
        this.levelManager = new LevelManager(canvas, levelConfig, bg, swooshSound);
        
        // Power-up states
        this.isSpeechActive = false;
        this.speechEffectStartTime = null;
        
        // Initialize managers
        this.powerUpManager = new PowerUpManager(this);
        this.collisionManager = new CollisionManager(this);
        this.uiManager = new UIManager(this);
        this.obstacleManager = new ObstacleManager(this);
        this.cloneManager = new CloneManager(this);

        this.updateBackground();
    }

    /**
     * Update the background image based on current level
     */
    updateBackground() {
        if (this.levelManager.currentLevel - 1 < this.levelManager.backgroundImages.length) {
            this.bg.src = this.levelManager.backgroundImages[this.levelManager.currentLevel - 1];
        }
    }

    /**
     * Reset the game to initial state
     */
    reset() {
        this.player.reset();
        this.pipes = [];
        this.enemyBirds = [];
        this.score = 0;
        this.lastPipe = 0;
        this.levelManager.currentLevel = 1;
        this.lastLostLevel = 1;
        this.updateBackground();
        this.gameOver = false;
        this.levelManager.showLevelUp = false;
        this.bgMusic.currentTime = 0;
        this.bgMusic.play();
        this.lives = 1;
        this.isSpeechActive = false;
        this.speechEffectStartTime = null;
        
        // Reset managers
        this.powerUpManager.reset();
        this.cloneManager.reset();
        this.player.hasPointerPowerUp = false; // Reset pointer power-up state
    }

    /**
     * Update game state for each frame
     * @param {number} timestamp - Current animation timestamp
     */
    update(timestamp) {
        const config = this.levelManager.getCurrentConfig();
        
        if (!this.gameOver && !this.levelManager.isLevelTransition) {
            // Store player's current position and velocity
            this.powerUpManager.updatePlayerHistory(this.player);

            // Update player
            this.player.update(config.gravity);

            // Update cloned players
            this.cloneManager.update(config.gravity);

            // Create and update obstacles
            this.obstacleManager.update(timestamp, config);

            // Check for collisions
            this.collisionManager.checkCollisions();
            
            // Check for level progression
            this.levelManager.checkLevelUp(this.score, timestamp);

            // Handle power-ups
            this.powerUpManager.update(config);
        }

        // Ensure lives don't go below 0
        if (this.lives < 0) {
            this.lives = 0;
        }

        // Continue game if player has lives
        if (this.lives > 0) {
            return;
        }

        // Reset pipe timer during level transition
        if (this.levelManager.isLevelTransition) {
            this.lastPipe = timestamp;
        }
    }

    /**
     * Render the game state
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} timestamp - Current animation timestamp
     */
    draw(ctx, timestamp) {
        ctx.imageSmoothingEnabled = false; // Disable image smoothing for pixelated effect
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.drawImage(this.bg, 0, 0, this.canvas.width, this.canvas.height);

        // Handle level transition animation
        if (this.levelManager.isLevelTransition) {
            this.drawLevelTransition(ctx, timestamp);
            return;
        }

        // Draw game elements
        this.drawGameElements(ctx);
        
        // Draw UI elements
        this.uiManager.draw(ctx, timestamp);
    }
    
    /**
     * Draw level transition animation
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} timestamp - Current animation timestamp
     */
    drawLevelTransition(ctx, timestamp) {
        const elapsedTime = timestamp - this.levelManager.levelTransitionStartTime;
        
        // Animate player during transition
        this.player.y = this.canvas.height / 2 + Math.sin(elapsedTime / 200) * 10;
        this.player.draw(ctx);
        
        // Draw level up message
        this.levelManager.drawLevelUpMessage(ctx, timestamp);
        this.uiManager.drawLevelInfo(ctx);

        // End transition after duration
        if (elapsedTime > this.levelTransitionDuration) {
            this.levelManager.isLevelTransition = false;
            this.levelManager.showLevelUp = false;
            this.levelManager.currentLevel++;
            this.levelManager.updateBackground();
        }
    }
    
    /**
     * Draw all game elements (pipes, enemies, power-ups, player)
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawGameElements(ctx) {
        // Draw obstacles
        this.obstacleManager.draw(ctx);

        // Draw power-ups
        this.powerUpManager.draw(ctx);

        // Draw cloned players and main player
        this.cloneManager.draw(ctx);
        this.player.draw(ctx);
        
        // Draw speech effect indicator
        if (this.isSpeechActive) {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Draw pointer power-up indicator
        if (this.player.hasPointerPowerUp) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.2)'; // Golden color
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw control instructions
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(10, 10, 300, 60);
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.fillText('Pointer Power-Up Active!', 20, 30);
            ctx.fillText('Use ↑↓ or W/S keys to move freely', 20, 55);
        }
    }

    /**
     * Reset game to the last level where player lost a life
     */
    resetLevel() {
        this.reset();
        this.levelManager.currentLevel = this.lastLostLevel;
        this.levelManager.updateBackground();
        this.bgMusic.currentTime = 0;
        this.bgMusic.play();
    }

    /**
     * Reset the current level
     */
    resetCurrentLevel() {
        // Save the current pointer power-up state
        const hasPointerPowerUp = this.player.hasPointerPowerUp;
        
        this.player.reset();
        this.pipes = [];
        this.enemyBirds = [];
        this.lastPipe = 0;
        this.isSpeechActive = false;
        this.speechEffectStartTime = null;
        this.bg.src = this.levelManager.backgroundImages[this.levelManager.currentLevel - 1];
        this.bgMusic.currentTime = 0;
        this.bgMusic.play();
        
        // Reset managers
        this.powerUpManager.reset();
        this.cloneManager.reset();
        
        // Restore the pointer power-up state
        this.player.hasPointerPowerUp = hasPointerPowerUp;
    }
}