/**
 * Enemy class representing the enemy birds in the game
 */
export class Enemy {
    /**
     * Initialize a new enemy
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {number} speed - Movement speed
     */
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.width = 34;
        this.height = 24;
        this.speed = speed;
    }

    /**
     * Update enemy position
     */
    update() {
        this.x -= this.speed;
    }

    /**
     * Draw the enemy
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Image} enemies - Enemy image
     */
    draw(ctx, enemies) {
        ctx.save();
        ctx.translate(this.x + 17, this.y + 12);
        ctx.drawImage(enemies, -17, -12, 34, 24);
        ctx.restore();
    }

    /**
     * Check if enemy is off screen
     * @returns {boolean} - True if enemy is off screen
     */
    isOffScreen() {
        return this.x + this.width < 0;
    }
}
