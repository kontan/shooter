/// <reference path="Vector2.ts" />

module BulletStorm {
    export class Bullet{
        position: Vector2 = new Vector2(0, 0);
        velocity: Vector2 = new Vector2(0, 0);
        angle: number = 0;
        constructor(public size: number){            
        }
        update(): void{
            this.position.add(this.velocity);
        }
        paint(g: CanvasRenderingContext2D): void{
        }
    }
    Object.freeze(Bullet);
}