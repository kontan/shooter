module BulletStorm {
    export class Vector2 {
        constructor(public x?: number = 0, public y?: number = 0) {
            Object.seal(this);
        }
        static fromAngle(angle: number, length?: number = 1): Vector2{
        	return new Vector2(
    	    	length * Math.cos(angle), 
    	    	length * Math.sin(angle)
    	    );
        }
        copy(v: Vector2): Vector2 {
            this.x = v.x;
            this.y = v.y;
            return this;
        }
        add(v: Vector2): Vector2 {
            this.x += v.x;
            this.y += v.y;
            return this;
        } 
        addVectors(a: Vector2, b: Vector2): Vector2 {
            this.x = a.x + b.x;
            this.y = a.y + b.y;
            return this;
        }
        subVectors(a: Vector2, b: Vector2): Vector2 {
            this.x = a.x - b.x;
            this.y = a.y - b.y;
            return this;
        }
        mul(t: number): Vector2{
            this.x *= t;
            this.y *= t;
            return this;
        }
        length(): number {
            return Math.sqrt(this.lengthSq());
        }
        lengthSq(): number {
            return this.x * this.x + this.y * this.y;
        }
        setLength(v: number): Vector2{
        	var t = v / this.length();
        	this.x *= t;
        	this.y *= t;
        	return this;
        }
        clone(): Vector2{
            return new Vector2(this.x, this.y);
        }
        getAngle(): number{
        	return Math.atan2(this.y, this.x);
        }
    }
    Object.freeze(Vector2);
}
