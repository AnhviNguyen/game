import { GameObject } from "./GameObject.js";

export default class Square extends GameObject
{
    constructor (context, x, y, vx, vy){
        super(context, x, y, vx, vy);
        this.width = 50;
        this.height = 50;
    }

    draw(){
        this.context.fillStyle = this.isColliding?'#ff8080':'#0099b0';
        this.context.fillRect(this.x, this.y, this.width, this.height);
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

