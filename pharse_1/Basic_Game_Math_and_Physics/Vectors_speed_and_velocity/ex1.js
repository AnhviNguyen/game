export class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    addVectors(that) {
        return new Vector( this.x + that.x, this.y + that.y )
    }

    subtractVectors(that) {
        return new Vector( this.x - that.x, this.y - that.y )
    }

    multiplyVector(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        let mag = this.magnitude();
        return new Vector(this.x / mag, this.y / mag );
    }
}
