export default class Bullet {
    constructor(ctx, x, y, vx, vy, radius) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.speed = Math.sqrt(vx * vx + vy * vy); // Lưu tốc độ ban đầu
        this.radius = radius;
        this.collisionImpact = 250; // Lực tác động lên circle khi va chạm
    }

    update(secondsPassed) {
        this.prevX = this.x;
        this.prevY = this.y;
        
        // Duy trì vận tốc không đổi
        this.x += this.vx * secondsPassed;
        this.y += this.vy * secondsPassed;

        // Va chạm với tường
        if (this.x - this.radius < 0 || this.x + this.radius > this.ctx.canvas.width) {
            this.vx = -this.vx;
        }
        if (this.y - this.radius < 0 || this.y + this.radius > this.ctx.canvas.height) {
            this.vy = -this.vy;
        }

        // Đảm bảo tốc độ luôn không đổi
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (currentSpeed !== this.speed) {
            this.vx = (this.vx / currentSpeed) * this.speed;
            this.vy = (this.vy / currentSpeed) * this.speed;
        }
    }

    detectCollisionWithCircle(circle) {
        const dx = this.x - circle.x;
        const dy = this.y - circle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= (this.radius + circle.radius);
    }

    handleCollision(circle) {
        // Tính vector pháp tuyến
        const dx = circle.x - this.x;
        const dy = circle.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / distance;
        const ny = dy / distance;

        // Đổi hướng bullet (phản xạ)
        const dotProduct = (this.vx * nx + this.vy * ny);
        this.vx = this.vx - 2 * dotProduct * nx;
        this.vy = this.vy - 2 * dotProduct * ny;

        // Chuẩn hóa vận tốc bullet
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        this.vx = (this.vx / currentSpeed) * this.speed;
        this.vy = (this.vy / currentSpeed) * this.speed;

        // Truyền động lượng cho circle
        circle.vx += nx * this.collisionImpact;
        circle.vy += ny * this.collisionImpact;

        // Tránh chồng lấp
        const overlap = this.radius + circle.radius - distance;
        if (overlap > 0) {
            this.x -= overlap * nx * 0.5;
            this.y -= overlap * ny * 0.5;
            circle.x += overlap * nx * 0.5;
            circle.y += overlap * ny * 0.5;
        }
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.isColliding ? "red" : "black";
        this.ctx.fill();
        this.ctx.closePath();
    }
}