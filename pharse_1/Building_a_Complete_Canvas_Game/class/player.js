/**
 * Player class representing the bird controlled by the user
 */
export class Player {
    /**
     * Initialize a new player
     * @param {HTMLCanvasElement} canvas - The game canvas
     * @param {Audio} flapSound - Sound to play when flapping
     */
    constructor(canvas, flapSound) {
        this.canvas = canvas;
        this.flapSound = flapSound;
        this.x = 50;
        this.y = canvas.height / 2;
        this.velocity = 0;
        this.jump = -6;
        this.sprites = [];
        this.currentFrame = 0;
        this.frameCount = 0;
        this.verticalSpeed = 4; // Speed for vertical movement with arrow keys
        this.hasPointerPowerUp = false; // Flag to track if player has the pointer power-up
        this.pointerPowerUpStartTime = null; // Track when the pointer power-up was activated

        // Load player animation sprites
        for (let i = 0; i < 4; i++) {
            const img = new Image();
            img.src = `img/flappybird${i}.png`;
            this.sprites.push(img);
        }
    }

    /**
     * Update player position and animation
     * @param {number} gravity - Current gravity value
     */
    update(gravity) {
        // If player has pointer power-up, don't apply gravity
        if (!this.hasPointerPowerUp) {
            this.velocity += gravity;
            this.y += this.velocity;
        }
        
        this.frameCount++;
        if (this.frameCount % 10 === 0) {
            this.currentFrame = (this.currentFrame + 1) % this.sprites.length;
        }
    }

    /**
     * Draw the player with rotation based on velocity
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + 17, this.y + 12);
        
        // Only apply rotation if pointer power-up is not active
        if (!this.hasPointerPowerUp) {
            ctx.rotate(Math.min(Math.max(this.velocity * 0.05, -0.5), 0.5));
        } else {
            // Apply a slight hover effect when pointer power-up is active
            const hoverOffset = Math.sin(Date.now() * 0.005) * 2;
            ctx.translate(0, hoverOffset);
        }
        
        ctx.drawImage(this.sprites[this.currentFrame], -17, -12, 34, 24);
        ctx.restore();
    }

    /**
     * Make the player flap upward
     */
    flap() {
        this.velocity = this.jump;
        this.flapSound.play();
    }

    /**
     * Move the player up with arrow key or W key
     */
    moveUp() {
        if (this.hasPointerPowerUp) {
            this.y -= this.verticalSpeed;
            // Prevent going above the canvas
            if (this.y < 0) {
                this.y = 0;
            }
        }
    }

    /**
     * Move the player down with arrow key or S key
     */
    moveDown() {
        if (this.hasPointerPowerUp) {
            this.y += this.verticalSpeed;
            // Prevent going below the canvas
            if (this.y + 24 > this.canvas.height) {
                this.y = this.canvas.height - 24;
            }
        }
    }

    /**
     * Activate the pointer power-up
     */
    activatePointerPowerUp() {
        this.hasPointerPowerUp = true;
        this.pointerPowerUpStartTime = Date.now();
        console.log("Pointer power-up activated! Free movement with arrow keys, but still vulnerable to obstacles.");
    }

    /**
     * Reset player to initial position
     */
    reset() {
        this.y = this.canvas.height / 2;
        this.velocity = 0;
        this.hasPointerPowerUp = false; // Reset power-up state on reset
        this.pointerPowerUpStartTime = null;
        
        // Log player reset
        console.log("Player reset - all power-ups deactivated");
    }
}