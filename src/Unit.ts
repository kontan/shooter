/// <reference path="Vector2.ts" />

module BulletStorm {
    export class Unit{

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
        constructor(private shooter: Shooter, private images: UnitImages){
        }

        update(): void{
            this.position.x = Math.max(0, Math.min(this.shooter.width,  this.position.x + this.velocity.x));
            this.position.y = Math.max(0, Math.min(this.shooter.height, this.position.y + this.velocity.y));

            this.img = this.velocity.y < 0 ? this.images.front : 
                       this.velocity.y > 0 ? this.images.back :
                       this.velocity.x < 0 ? this.images.left :
                       this.velocity.x > 0 ? this.images.right :
                       this.images.image;
            this.velocity = new Vector2(0, 0);
        }
        paint(g: CanvasRenderingContext2D): void{
            g.drawImage(this.img, -this.img.width / 2, -this.img.height / 2);
        }
    }
}