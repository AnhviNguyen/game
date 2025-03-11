/**
 * Clone class representing the clone power-up in the game
 */
export class Clone {
    /**
     * Initialize a new clone power-up
     */
    constructor() {
        this.width = 34;
        this.height = 24;
        this.image = new Image();
        this.image.src = 'img/flappybird.png';
    }

    /**
     * Draw the clone power-up
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    draw(ctx, x, y) {
        ctx.drawImage(this.image, x, y, this.width, this.height);
    }
} 