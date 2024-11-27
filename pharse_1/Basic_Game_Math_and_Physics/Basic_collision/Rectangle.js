import { GameObject } from "./GameObject.js";

export default class Rectangle extends GameObject
{
    constructor (context, x, y, vx, vy, mass, rotation, rotationSpeed, width, height){
        super(context, x, y, vx, vy);
        this.width = width;
        this.height = height;
        this.mass = 5;
        this.rotation = rotation;
        this.rotationSpeed= rotationSpeed
    }

    draw(){
        this.context.fillStyle = this.isColliding?'#ff8080':'#0099b0';
        this.context.fillRect(this.x, this.y, this.width, this.height);
        this.context.lineWidth = 2; 
        this.context.strokeStyle = '#000000'; 
    
        this.context.strokeRect(this.x, this.y, this.width, this.height);
    }

    update(secondsPassed){
        this.x += this.vx * secondsPassed;
        this.y += this.vy * secondsPassed;
        if (this.x < 0 || this.x + this.width > this.context.canvas.width) {
            this.vx = -this.vx;
        }

        if (this.y < 0 || this.y + this.height > this.context.canvas.height) {
            this.vy = -this.vy;
        }
    }
}
