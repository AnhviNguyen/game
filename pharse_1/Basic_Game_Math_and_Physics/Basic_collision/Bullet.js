export default class Bullet {
    constructor(ctx, x, y, vx, vy, radius) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
    }

    update(secondsPassed) {
        this.prevX = this.x; 
        this.prevY = this.y;
        this.x += this.vx * secondsPassed;
        this.y += this.vy * secondsPassed;

        if (this.x - this.radius < 0 || this.x + this.radius > this.ctx.canvas.width) {
            this.vx = -this.vx;
        }
    
        if (this.y - this.radius < 0 || this.y + this.radius > this.ctx.canvas.height) {
            this.vy = -this.vy; 
        }
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = "black";
        this.ctx.fill();
        this.ctx.closePath();
    }

    detectCollisionWithCircle(circle) {
        const bulletPath = {
            startX: this.prevX,
            startY: this.prevY,
            endX: this.x,
            endY: this.y
        };
    
        return this.lineIntersectsCircle(bulletPath, circle);
    }

    lineIntersectsCircle(line, circle) {
        const { startX, startY, endX, endY } = line;
        const { x: cx, y: cy, radius } = circle;
    
        // Vector from line start to circle center
        const lineVecX = endX - startX;
        const lineVecY = endY - startY;
        const centerVecX = cx - startX;
        const centerVecY = cy - startY;
    
        // Project circle center onto the line
        const lineLength = Math.sqrt(lineVecX * lineVecX + lineVecY * lineVecY);
        const t = ((centerVecX * lineVecX + centerVecY * lineVecY) / (lineLength * lineLength));
    
        // Find the closest point on the line to the circle center
        const closestX = startX + t * lineVecX;
        const closestY = startY + t * lineVecY;
    
        // Calculate distance between closest point and circle center
        const distanceX = cx - closestX;
        const distanceY = cy - closestY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
        // Check if the closest point is within the line segment and collision radius
        return distance <= radius && t >= 0 && t <= 1;
    }    
}
