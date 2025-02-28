export class Enemy {

    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.width = 34;
        this.height = 24;
        this.speed = speed;
    }



    update() {
        this.x -= this.speed;
    }



    draw(ctx, enemies) {
        ctx.save();
        ctx.translate(this.x + 17, this.y + 12);
        ctx.drawImage(enemies, -17, -12, 34, 24);
        ctx.restore();
    }



    isOffScreen() {
        return this.x + this.width < 0;
    }
}
