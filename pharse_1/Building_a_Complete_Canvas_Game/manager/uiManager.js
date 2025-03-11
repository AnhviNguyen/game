/**
 * UIManager class to handle all UI rendering
 */
export class UIManager {
    /**
     * Initialize the UI manager
     * @param {Game} game - Reference to the main game object
     */
    constructor(game) {
        this.game = game;
    }
    
    /**
     * Draw all UI elements
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} timestamp - Current animation timestamp
     */
    draw(ctx, timestamp) {
        // Draw score
        this.drawScore(ctx);

        // Draw level info
        this.drawLevelInfo(ctx);
        this.game.levelManager.drawLevelUpMessage(ctx, timestamp);

        // Draw next level progress bar
        this.drawNextLevelProgress(ctx);
        
        // Draw lives progress bar
        this.drawLivesProgress(ctx);
    }
    
    /**
     * Draw the current score
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawScore(ctx) {
        ctx.fillStyle = 'white';
        ctx.lineWidth = 2;
        ctx.font = '30px "Press Start 2P", cursive';
        ctx.strokeText(this.game.score, this.game.canvas.width / 2 - 10, 50);
        ctx.fillText(this.game.score, this.game.canvas.width / 2 - 10, 50);
    }
    
    /**
     * Draw progress bar for next level
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawNextLevelProgress(ctx) {
        if (this.game.levelManager.currentLevel < 5) {
            const nextRequired = this.game.levelConfig[this.game.levelManager.currentLevel].requiredScore;
            const progress = Math.min(this.game.score / nextRequired, 1);
            const barWidth = 200;
            const barHeight = 20;
            const barX = 20;
            const barY = 70;

            // Draw progress bar background
            ctx.fillStyle = 'black';
            ctx.fillRect(barX + 130, barY - 15, barWidth, barHeight);

            // Draw filled portion
            ctx.fillStyle = 'green';
            ctx.fillRect(barX + 130, barY - 15, barWidth * progress, barHeight);

            // Draw border
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.strokeRect(barX + 130, barY - 15, barWidth, barHeight);

            // Draw label
            ctx.fillStyle = 'white';
            ctx.fillText(`Next Level: `, barX, barY);
        }
    }
    
    /**
     * Draw lives progress bar
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawLivesProgress(ctx) {
        // Draw lives label
        ctx.fillStyle = 'white';
        ctx.font = '20px "Press Start 2P", cursive';
        ctx.fillText(`Lives:`, 20, 100);

        const barWidth = 200;
        const barHeight = 20;
        const barX = 20;
        const barY = 90;
 
        // Draw background
        ctx.fillStyle = 'black';
        ctx.fillRect(barX + 130, barY, barWidth, barHeight);

        // Draw filled portion
        ctx.fillStyle = 'red';
        ctx.fillRect(barX + 130, barY, barWidth * (this.game.lives / 3), barHeight);

        // Draw border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX + 130, barY, barWidth, barHeight);
    }

    /**
     * Draw level and high score information
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawLevelInfo(ctx) {
        ctx.font = '20px "Press Start 2P", cursive';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.fillText(`Level: ${this.game.levelManager.currentLevel}`, 20, 30);
        ctx.fillText(`High Score: ${this.game.highScore}`, this.game.canvas.width - 150, 30);
    }
} 