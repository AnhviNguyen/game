import { Heart } from '../class/heart.js';
import { Speech } from '../class/speech.js';
import { Clone } from '../class/clone.js';
import { Pointer } from '../class/pointer.js';
import { Player } from '../class/player.js';

/**
 * PowerUpManager class to handle all power-ups in the game
 */
export class PowerUpManager {
    /**
     * Initialize the power-up manager
     * @param {Game} game - Reference to the main game object
     */
    constructor(game) {
        this.game = game;
        
        // Power-up objects
        this.hearts = [];
        this.speeches = [];
        this.clonePowerups = [];
        this.pointerPowerups = [];
        
        // Power-up instances
        this.heart = new Heart();
        this.speech = new Speech();
        this.clone = new Clone();
        this.pointer = new Pointer();
        
        // Player position history for clone movement
        this.playerPositionHistory = [];
        this.positionHistoryMaxLength = 15;
    }
    
    /**
     * Reset all power-ups
     */
    reset() {
        this.hearts = [];
        this.speeches = [];
        this.clonePowerups = [];
        this.pointerPowerups = [];
        this.playerPositionHistory = [];
    }
    
    /**
     * Update player position history for clone movement
     * @param {Player} player - The main player
     */
    updatePlayerHistory(player) {
        this.playerPositionHistory.unshift({
            x: player.x,
            y: player.y,
            velocity: player.velocity
        });
        
        // Keep only the last N positions
        if (this.playerPositionHistory.length > this.positionHistoryMaxLength) {
            this.playerPositionHistory.pop();
        }
    }
    
    /**
     * Update all power-ups
     * @param {Object} config - Current level configuration
     */
    update(config) {
        this.updateHearts(config);
        this.updateSpeeches(config);
        this.updateClonePowerups(config);
        this.updatePointerPowerups(config);
    }
    
    /**
     * Update heart power-ups
     * @param {Object} config - Current level configuration
     */
    updateHearts(config) {
        // Update existing hearts
        this.hearts.forEach((heart, index) => {
            heart.x -= config.pipeSpeed;
            if (heart.x < -20) {
                this.hearts.splice(index, 1);
            }
        });

        // Randomly create hearts
        if (Math.random() < 0.0005) {
            this.createHeart();
        }
        
        this.checkHeartCollisions();
    }
    
    /**
     * Update speech power-ups
     * @param {Object} config - Current level configuration
     */
    updateSpeeches(config) {
        // Update existing speeches
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
    
    /**
     * Update clone power-ups
     * @param {Object} config - Current level configuration
     */
    updateClonePowerups(config) {
        // Update existing clone power-ups
        this.clonePowerups.forEach((powerup, index) => {
            powerup.x -= config.pipeSpeed;
            if (powerup.x < -20) {
                this.clonePowerups.splice(index, 1);
            }
        });

        // Randomly create clone power-ups
        if (Math.random() < 0.0005) {
            this.createClonePowerup();
        }
        
        this.checkClonePowerupCollisions();
    }
    
    /**
     * Update pointer power-ups
     * @param {Object} config - Current level configuration
     */
    updatePointerPowerups(config) {
        // Update existing pointer power-ups
        this.pointerPowerups.forEach((pointer, index) => {
            pointer.x -= config.pipeSpeed;
            if (pointer.x < -40) {
                this.pointerPowerups.splice(index, 1);
            }
        });

        // Randomly create pointer power-ups
        if (Math.random() < 0.0005) {
            this.createPointerPowerup();
            console.log("Created pointer power-up. Total:", this.pointerPowerups.length);
        }
        
        this.checkPointerCollisions();
    }
    
    /**
     * Draw all power-ups
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    draw(ctx) {
        // Draw hearts
        this.hearts.forEach(heart => 
            this.heart.draw(ctx, heart.x, heart.y)
        );
        
        // Draw speeches
        this.speeches.forEach(speech => 
            this.speech.draw(ctx, speech.x, speech.y)
        );
        
        // Draw clone power-ups
        this.clonePowerups.forEach(powerup => 
            this.clone.draw(ctx, powerup.x, powerup.y)
        );
        
        // Draw pointer power-ups
        this.pointerPowerups.forEach(pointer => 
            this.pointer.draw(ctx, pointer.x, pointer.y)
        );
    }
    
    /**
     * Create a heart power-up at random position
     */
    createHeart() {
        const xPosition = Math.random() * (this.game.canvas.width - 50) + 25;
        const yPosition = Math.random() * (this.game.canvas.height - 50) + 25;
        this.hearts.push({ x: xPosition, y: yPosition });
    }

    /**
     * Check for collisions with heart power-ups
     */
    checkHeartCollisions() {
        this.hearts.forEach((heart, index) => {
            if (this.game.player.x < heart.x + 20 && 
                this.game.player.x + 34 > heart.x &&
                this.game.player.y < heart.y + 20 && 
                this.game.player.y + 24 > heart.y) {
                
                this.hearts.splice(index, 1);
                
                // Increase lives up to maximum of 3
                if (this.game.lives < 3) {
                    this.game.lives++;
                }
            }
        });
    }

    /**
     * Create a speech power-up at random position
     */
    createSpeech() {
        const xPosition = Math.random() * (this.game.canvas.width - 50) + 25;
        const yPosition = Math.random() * (this.game.canvas.height - 50) + 25;
        this.speeches.push({ x: xPosition, y: yPosition });
    }

    /**
     * Check for collisions with speech power-ups
     */
    checkSpeechCollisions() {
        this.speeches.forEach((speech, index) => {
            if (this.game.player.x < speech.x + 20 && 
                this.game.player.x + 34 > speech.x &&
                this.game.player.y < speech.y + 20 && 
                this.game.player.y + 24 > speech.y) {
                
                this.speeches.splice(index, 1);
                this.speech.applyEffect(this.game.player, this.game);
                
                // Play sound effect if not muted
                if (!this.game.flapSound.muted) {
                    this.game.pointSound.play();
                }
            }
        });
    }

    /**
     * Create a clone power-up
     */
    createClonePowerup() {
        const xPosition = this.game.canvas.width;
        const yPosition = Math.random() * (this.game.canvas.height - 50) + 25;
        this.clonePowerups.push({ x: xPosition, y: yPosition });
    }

    /**
     * Check for collisions with clone power-ups
     */
    checkClonePowerupCollisions() {
        this.clonePowerups.forEach((powerup, index) => {
            if (this.game.player.x < powerup.x + this.clone.width && 
                this.game.player.x + 34 > powerup.x &&
                this.game.player.y < powerup.y + this.clone.height && 
                this.game.player.y + 24 > powerup.y) {
                
                // Remove the power-up
                this.clonePowerups.splice(index, 1);

                // Create a clone if below maximum
                if (this.game.cloneManager.canAddMoreClones()) {
                    this.game.cloneManager.addClone();
                }
            }
        });
    }

    /**
     * Create a new pointer power-up
     */
    createPointerPowerup() {
        const pointer = Object.create(this.pointer);
        
        // Position the pointer at the right edge of the screen with random height
        pointer.x = this.game.canvas.width;
        pointer.y = Math.random() * (this.game.canvas.height - 80) + 40;
        
        // Add width and height properties
        pointer.width = 40;
        pointer.height = 40;
        
        this.pointerPowerups.push(pointer);
    }
    
    /**
     * Check for collisions with pointer power-ups
     */
    checkPointerCollisions() {
        this.pointerPowerups.forEach((pointer, index) => {
            if (this.game.player.x < pointer.x + pointer.width &&
                this.game.player.x + 34 > pointer.x &&
                this.game.player.y < pointer.y + pointer.height &&
                this.game.player.y + 24 > pointer.y) {
                
                // Activate pointer power-up using the new method
                this.game.player.activatePointerPowerUp();
                
                // Remove the collected pointer
                this.pointerPowerups.splice(index, 1);
                
                // Play a sound effect
                if (!this.game.flapSound.muted) {
                    this.game.pointSound.play();
                }
            }
        });
    }
} 