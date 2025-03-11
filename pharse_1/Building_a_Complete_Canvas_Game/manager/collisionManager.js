/**
 * CollisionManager class to handle all collision detection and response
 */
export class CollisionManager {
    /**
     * Initialize the collision manager
     * @param {Game} game - Reference to the main game object
     */
    constructor(game) {
        this.game = game;
    }
    
    /**
     * Check for collisions between player, clones and obstacles
     */
    checkCollisions() {
        // Skip collision detection when speech power-up is active
        if (this.game.isSpeechActive) {
            return;
        }

        // Skip collision detection when pointer power-up is active
        if (this.game.player.hasPointerPowerUp) {
            return;
        }

        // Check main player collision
        if (this.checkPlayerCollision(this.game.player)) {
            if (this.game.cloneManager.getCloneCount() > 0) {
                this.game.cloneManager.replacePlayerWithClone();
            } else {
                this.handlePlayerHit();
            }
        }

        // Check clone collisions
        this.checkCloneCollisions();
    }
    
    /**
     * Handle player being hit when no clones are available
     */
    handlePlayerHit() {
        this.game.hitSound.play();
        this.game.lives--;
        this.game.lastLostLevel = this.game.levelManager.currentLevel;
        
        if (this.game.lives > 0) {
            this.game.resetCurrentLevel();
        } else {
            this.game.dieSound.play();
            this.game.gameOver = true;
            this.game.bgMusic.pause();
            this.game.highScore = Math.max(this.game.highScore, this.game.score);
        }
    }
    
    /**
     * Check for collisions with cloned players
     */
    checkCloneCollisions() {
        this.game.cloneManager.clonedPlayers.forEach((clone, index) => {
            if (this.checkPlayerCollision(clone)) {
                // Remove the hit clone
                this.game.hitSound.play();
                this.game.cloneManager.removeClone(index);
            }
        });
    }

    /**
     * Check if a player or clone has collided with obstacles
     * @param {Player} player - The player or clone to check
     * @returns {boolean} - True if collision detected
     */
    checkPlayerCollision(player) {
        // Skip collision detection for main player when pointer power-up is active
        if (player === this.game.player && player.hasPointerPowerUp) {
            return false;
        }

        // Check pipe collisions
        for (let pipe of this.game.pipes) {
            if (player.x + 34 > pipe.x && player.x < pipe.x + 52) {
                // Check collision only when speech effect is not active
                if (!this.game.isSpeechActive && 
                    (player.y < pipe.topHeight || 
                     player.y + 24 > pipe.topHeight + pipe.pipeGap)) {
                    return true;
                }
                
                // Score point when passing pipe (only for main player)
                if (!pipe.passed && player === this.game.player) {
                    this.game.score++;
                    pipe.passed = true;
                    this.game.pointSound.play();
                }
            }
        }

        // Skip remaining collision checks if speech effect is active
        if (this.game.isSpeechActive) {
            return false;
        }

        // Check enemy bird collisions
        for (let enemy of this.game.enemyBirds) {
            if (player.x < enemy.x + enemy.width && 
                player.x + 34 > enemy.x &&
                player.y < enemy.y + enemy.height && 
                player.y + 24 > enemy.y) {
                return true;
            }
        }

        // Check screen boundary collisions
        if (player.y < 0 || player.y + 24 > this.game.canvas.height) {
            return true;
        }

        return false;
    }
} 