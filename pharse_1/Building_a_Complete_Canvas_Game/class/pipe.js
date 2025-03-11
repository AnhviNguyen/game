/**
 * Pipe class representing the obstacles in the game
 */
export class Pipe {
    /**
     * Initialize a new pipe
     * @param {number} x - Initial x position
     * @param {number} topHeight - Height of the top pipe
     * @param {number} pipeGap - Gap between top and bottom pipes
     * @param {number} oscillationOffset - Offset for oscillation effect
     */
    constructor(x, topHeight, pipeGap, oscillationOffset) {
        this.x = x;
        this.topHeight = topHeight;
        this.passed = false;
        this.initialHeight = topHeight;
        this.oscillationOffset = oscillationOffset;
        this.pipeGap = pipeGap;
    }

    /**
     * Update pipe position and height
     * @param {number} pipeSpeed - Speed at which pipes move
     * @param {number} timestamp - Current animation timestamp
     * @param {number} oscillation - Oscillation intensity
     */
    update(pipeSpeed, timestamp, oscillation) {
        this.x -= pipeSpeed;
        if (oscillation) {
            this.topHeight = this.initialHeight + Math.sin(timestamp * 0.001 + this.oscillationOffset) * 50 * oscillation;
        }
    }

    /**
     * Draw the pipe
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Image} topPipe - Top pipe image
     * @param {Image} bottomPipe - Bottom pipe image
     * @param {number} canvasHeight - Height of the canvas
     */
    draw(ctx, topPipe, bottomPipe, canvasHeight) {
        ctx.drawImage(topPipe, this.x, 0, 52, this.topHeight);
        ctx.drawImage(bottomPipe, this.x, this.topHeight + this.pipeGap, 52, canvasHeight - this.topHeight - this.pipeGap);
    }

    /**
     * Check if pipe is off screen
     * @returns {boolean} - True if pipe is off screen
     */
    isOffScreen() {
        return this.x < -52;
    }
}
