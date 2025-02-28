export class Player {

    constructor(canvas, flapSound) {
        this.canvas = canvas;
        this.flapSound = flapSound;
        this.x = 50;
        this.y = canvas.height / 2;
        this.velocity = 0;
        this.jump = -6;
        this.sprites = [];
        this.currentFrame = 0;
        this.frameCount = 0;

        for (let i = 0; i < 4; i++) {
            const img = new Image();
            img.src = `img/flappybird${i}.png`;
            this.sprites.push(img);
        }
    }



    update(gravity) {
        this.velocity += gravity;
        this.y += this.velocity;
        this.frameCount++;
        if (this.frameCount % 10 === 0) {
            this.currentFrame = (this.currentFrame + 1) % this.sprites.length;
        }
    }



    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + 17, this.y + 12);
        ctx.rotate(Math.min(Math.max(this.velocity * 0.05, -0.5), 0.5));
        ctx.drawImage(this.sprites[this.currentFrame], -17, -12, 34, 24);
        ctx.restore();
    }



    flap() {
        this.velocity = this.jump;
        this.flapSound.play();
    }



    reset() {
        this.y = this.canvas.height / 2;
        this.velocity = 0;
    }
}