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
    }

    draw(ctx, x, y) {
        ctx.drawImage(this.image, x, y, 40, 40);
    }
} 