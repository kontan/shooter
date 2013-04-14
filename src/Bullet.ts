/// <reference path="Vector2.ts" />

module BulletStorm {
    export interface IBullet {
        position: Vector2;
        velocity: Vector2;
        angle: number;
        size: number;
        update(): void;
        paint(g: CanvasRenderingContext2D): void;
    }

    export class Bullet implements IBullet {
        position: Vector2 = new Vector2(0, 0);
        velocity: Vector2 = new Vector2(0, 0);
        angle: number = 0;
        size: number = 0;

        update(): void{  
        }
        paint(g: CanvasRenderingContext2D): void{
        }
    }
    Object.freeze(Bullet);
}