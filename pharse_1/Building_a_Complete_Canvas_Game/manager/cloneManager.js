import { Player } from '../class/player.js';

/**
 * CloneManager class to handle all clone-related functionality
 */
export class CloneManager {
    /**
     * Initialize the clone manager
     * @param {Game} game - Reference to the main game object
     */
    constructor(game) {
        this.game = game;
        this.clonedPlayers = [];
        this.basePlayerX = 80;
        this.maxClones = 2;
    }
    
    /**
     * Reset all clones
     */
    reset() {
        this.clonedPlayers = [];
    }
    
    /**
     * Update all cloned players
     * @param {number} gravity - Current gravity value
     */
    update(gravity) {
        this.clonedPlayers.forEach((clone, index) => {
            const delay = (index + 1) * 5; // Each clone has increasing delay
            if (this.game.powerUpManager.playerPositionHistory.length > delay) {
                const historicPosition = this.game.powerUpManager.playerPositionHistory[delay];
                clone.x = this.game.player.x - 30 * (index + 1); // Space clones apart
                clone.y = historicPosition.y;
                clone.velocity = historicPosition.velocity;
            } else {
                clone.update(gravity);
            }
        });
    }
    
    /**
     * Draw all cloned players
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    draw(ctx) {
        this.clonedPlayers.forEach(clone => 
            clone.draw(ctx)
        );
    }
    
    /**
     * Add a new clone
     */
    addClone() {
        if (this.clonedPlayers.length < this.maxClones) {
            const newClone = new Player(this.game.canvas, this.game.flapSound);
            newClone.x = this.game.player.x - 30 * (this.clonedPlayers.length + 1);
            newClone.y = this.game.player.y;
            this.clonedPlayers.push(newClone);
            
            // Play sound effect if not muted
            if (!this.game.pointSound.muted) {
                this.game.pointSound.play();
            }
            
            return true;
        }
        return false;
    }
    
    /**
     * Remove a clone at the specified index
     * @param {number} index - Index of clone to remove
     */
    removeClone(index) {
        if (index >= 0 && index < this.clonedPlayers.length) {
            this.clonedPlayers.splice(index, 1);
            
            // Update positions of remaining clones
            this.clonedPlayers.forEach((remainingClone, idx) => {
                remainingClone.x = this.game.player.x - 30 * (idx + 1);
            });
            
            return true;
        }
        return false;
    }
    
    /**
     * Replace the main player with a clone
     * @returns {boolean} - True if replacement was successful
     */
    replacePlayerWithClone() {
        if (this.clonedPlayers.length > 0) {
            this.game.hitSound.play();
            
            // Get the first clone to become the new player
            const newPlayerClone = this.clonedPlayers.shift();
            
            // Set safe position for the new player
            const safeY = this.game.canvas.height / 2;
            const safeX = this.basePlayerX;
            
            // Replace player with clone
            this.game.player = newPlayerClone;
            this.game.player.x = safeX;
            this.game.player.y = safeY;
            this.game.player.velocity = 0;
            
            // Update remaining clones' positions
            this.clonedPlayers.forEach((clone, index) => {
                clone.x = this.game.player.x - 30 * (index + 1);
                clone.y = safeY;
                clone.velocity = 0;
            });
            
            // Remove nearby pipes to prevent immediate collisions
            this.game.pipes = this.game.pipes.filter(pipe => 
                pipe.x < this.game.player.x - 100 || pipe.x > this.game.player.x + 100
            );
            
            return true;
        }
        return false;
    }
    
    /**
     * Get the number of clones
     * @returns {number} - Number of clones
     */
    getCloneCount() {
        return this.clonedPlayers.length;
    }
    
    /**
     * Check if more clones can be added
     * @returns {boolean} - True if more clones can be added
     */
    canAddMoreClones() {
        return this.clonedPlayers.length < this.maxClones;
    }
} 