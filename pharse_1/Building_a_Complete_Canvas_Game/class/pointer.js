/**
 * Pointer class representing the pointer power-up
 * This power-up allows the player to control the bird with up and down arrow keys
 * without being affected by collisions after completing all existing levels
 */
export class Pointer {
    /**
     * Initialize a new pointer power-up
     */
    constructor() {
        this.image = new Image();
        this.image.src = 'img/pointer.png';
        this.width = 40;
        this.height = 40;
        this.scale = 1;
        this.scaleDirection = 0.02;
    }

    /**
     * Draw the pointer power-up
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    draw(ctx, x, y) {
        // Add pulsing effect
        this.scale += this.scaleDirection;
        if (this.scale > 1.2) {
            this.scale = 1.2;
            this.scaleDirection = -0.02;
        } else if (this.scale < 0.8) {
            this.scale = 0.8;
            this.scaleDirection = 0.02;
        }
        
        const width = this.width * this.scale;
        const height = this.height * this.scale;
        
        // Draw with glow effect
        ctx.save();
        ctx.shadowColor = 'rgba(255, 255, 0, 0.8)';
        ctx.shadowBlur = 15;
        ctx.drawImage(this.image, x - (width - this.width) / 2, y - (height - this.height) / 2, width, height);
        ctx.restore();
    }
} 