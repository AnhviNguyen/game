/**
 * Speech class representing the invincibility power-up in the game
 */
export class Speech {
    /**
     * Initialize a new speech power-up
     */
    constructor() {
        this.image = new Image();
        this.image.src = 'img/speech.png';
    }

    /**
     * Draw the speech power-up
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    draw(ctx, x, y) {
        ctx.drawImage(this.image, x, y, 40, 40);
    }

    /**
     * Apply invincibility effect to the player
     * @param {Player} player - The player object
     * @param {Game} game - The game object to manage effect state
     */
    applyEffect(player, game) {
        const originalPipeSpeed = game.levelManager.getCurrentConfig().pipeSpeed;
        
        // Increase pipe speed (which effectively increases player speed relative to pipes)
        game.levelManager.getCurrentConfig().pipeSpeed *= 5;

        // Save current collision state
        game.isSpeechActive = true;
        game.speechEffectStartTime = Date.now();

        // Display a message about the power-up
        console.log("Speech power-up activated! Invincibility and speed boost for 3 seconds.");

        // Reset effect after 3 seconds
        setTimeout(() => {
            game.levelManager.getCurrentConfig().pipeSpeed = originalPipeSpeed;
            game.isSpeechActive = false;
            console.log("Speech power-up effect ended.");
        }, 3000);
    }
} 