export class Pipe {
    constructor(x, topHeight, pipeGap, oscillationOffset) {
        this.x = x;
        this.topHeight = topHeight;
        this.passed = false;
        this.initialHeight = topHeight;
        this.oscillationOffset = oscillationOffset;
        this.pipeGap = pipeGap;
    }



    update(pipeSpeed, timestamp, oscillation) {
        this.x -= pipeSpeed;
        if (oscillation) {
            this.topHeight = this.initialHeight + Math.sin(timestamp * 0.001 + this.oscillationOffset) * 50 * oscillation;
        }
    }



    draw(ctx, topPipe, bottomPipe, canvasHeight) {
        ctx.drawImage(topPipe, this.x, 0, 52, this.topHeight);
        ctx.drawImage(bottomPipe, this.x, this.topHeight + this.pipeGap, 52, canvasHeight - this.topHeight - this.pipeGap);
    }



    isOffScreen() {
        return this.x < -52;
    }
}
