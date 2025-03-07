export class Clone {
    constructor() {
        this.width = 34;
        this.height = 24;
        this.image = new Image();
        this.image.src = 'img/flappybird.png';
    }

    draw(ctx, x, y) {
        ctx.drawImage(this.image, x, y, this.width, this.height);
    }
} 