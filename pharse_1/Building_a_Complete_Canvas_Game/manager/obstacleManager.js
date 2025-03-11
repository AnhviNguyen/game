import { Pipe } from '../class/pipe.js';
import { Enemy } from '../class/enemy.js';

/**
 * ObstacleManager class to handle all obstacles in the game
 */
export class ObstacleManager {
    /**
     * Initialize the obstacle manager
     * @param {Game} game - Reference to the main game object
     */
    constructor(game) {
        this.game = game;
    }
    
    /**
     * Update all obstacles
     * @param {number} timestamp - Current animation timestamp
     * @param {Object} config - Current level configuration
     */
    update(timestamp, config) {
        // Create new obstacles at intervals
        this.createObstacles(timestamp, config);

        // Update existing obstacles
        this.updateObstacles(config, timestamp);
    }
    
    /**
     * Draw all obstacles
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    draw(ctx) {
        // Draw pipes
        this.game.pipes.forEach(pipe => 
            pipe.draw(ctx, this.game.topPipe, this.game.bottomPipe, this.game.canvas.height)
        );

        // Draw enemy birds
        this.game.enemyBirds.forEach(enemy => 
            enemy.draw(ctx, this.game.enemies)
        );
    }
    
    /**
     * Create new obstacles at appropriate intervals
     * @param {number} timestamp - Current animation timestamp
     * @param {Object} config - Current level configuration
     */
    createObstacles(timestamp, config) {
        const randomOffset = Math.random() * 500;
        if (!this.game.lastPipe || timestamp - this.game.lastPipe >= config.pipeInterval + randomOffset) {
            this.createPipe();
            if (Math.random() < 0.8) {
                this.createEnemyBird();
            }
            this.game.lastPipe = timestamp;
        }
    }
    
    /**
     * Update positions of existing obstacles
     * @param {Object} config - Current level configuration
     * @param {number} timestamp - Current animation timestamp
     */
    updateObstacles(config, timestamp) {
        // Update pipes
        this.game.pipes.forEach((pipe, index) => {
            pipe.update(config.pipeSpeed, timestamp, config.pipeOscillation);
            if (pipe.isOffScreen()) {
                this.game.pipes.splice(index, 1);
            }
        });

        // Update enemy birds
        this.game.enemyBirds.forEach((enemy, index) => {
            enemy.update();
            if (enemy.isOffScreen()) {
                this.game.enemyBirds.splice(index, 1);
            }
        });
    }
    
    /**
     * Create a new pipe obstacle
     */
    createPipe() {
        const config = this.game.levelManager.getCurrentConfig();
        const minHeight = 50;
        const maxHeight = this.game.canvas.height - config.pipeGap - minHeight;
        const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        this.game.pipes.push(new Pipe(this.game.canvas.width, height, config.pipeGap, Math.random() * Math.PI * 2));
    }

    /**
     * Create a new enemy bird
     */
    createEnemyBird() {
        const enemyHeight = 24;
        const padding = enemyHeight / 2;
        const minY = padding;
        const maxY = this.game.canvas.height - enemyHeight - padding;
        const yPosition = Math.random() * (maxY - minY) + minY;
        this.game.enemyBirds.push(new Enemy(this.game.canvas.width + 100, yPosition, 5));
    }
} 