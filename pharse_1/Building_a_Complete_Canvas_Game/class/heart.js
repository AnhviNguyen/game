/**
 * Heart class representing the life power-up in the game
 */
export class Heart {
    /**
     * Initialize a new heart power-up
     */
    constructor() {
        this.image = new Image();
        this.image.src = 'img/heart.png';
    }

    /**
     * Draw the heart
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    draw(ctx, x, y) {
        ctx.drawImage(this.image, x, y, 40, 40);
    }
}
