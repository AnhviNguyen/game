import { GameObject } from "./GameObject.js";

export default class Circle extends GameObject
{
    constructor (context, x, y, vx, vy, radius){
        super(context, x, y, vx, vy);
        this.radius = radius || 25;
    }

    draw(){
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.context.fillStyle = this.isColliding ? '#ff8080' : '#0099b0';
        this.context.fill();
    }

    update(secondsPassed) {
        this.x += this.vx * secondsPassed;
        this.y += this.vy * secondsPassed;
    
        if (this.x - this.radius < 0 || this.x + this.radius > this.context.canvas.width) {
            this.vx = -this.vx;
        }
    
        if (this.y - this.radius < 0 || this.y + this.radius > this.context.canvas.height) {
            this.vy = -this.vy; 
        }
    }
}