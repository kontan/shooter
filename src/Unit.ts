/// <reference path="Vector2.ts" />

module BulletStorm {

    export interface IUnit{
        position: Vector2;
        velocity: Vector2;
        radius: number;
        update: () => void;
        paint: (g: CanvasRenderingContext2D) => void;
    }

    export class Unit implements IUnit{

        // このオブジェクトはこのユニットの位置を常に保持するオブジェクトとして、
        // ユニットの位置を追跡するのにもつかわれています
        // ユニットの位置を変更したい場合は、
        //     unit.position = newPosition;
        // というようにオブジェクトごと置き換えるのではなく、
        //     unit.position.copy(newPosition);
        // のように Vector2 のプロパティを書き換えるようにします。
        //
        // @readonly
        position: Vector2 = new Vector2(0, 0);

        // @readonly
        velocity: Vector2 = new Vector2(0, 0);

        radius: number = 5;

        img: HTMLImageElement = undefined;
        constructor(private images: UnitImages){
            
        }

        update(): void{
            this.img = this.velocity.y < 0 ? this.images.front : 
                       this.velocity.y > 0 ? this.images.back :
                       this.velocity.x < 0 ? this.images.left :
                       this.velocity.x > 0 ? this.images.right :
                       this.images.image;
        }
        paint(g: CanvasRenderingContext2D): void{
            g.drawImage(this.img, -this.img.width / 2, -this.img.height / 2);
        }
    }
}