export class Heart {
    constructor() {
        this.image = new Image();
        this.image.src = 'img/heart.png';
    }

    draw(ctx, x, y) {
        ctx.drawImage(this.image, x, y, 40, 40);
    }
}
