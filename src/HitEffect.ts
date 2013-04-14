/// <reference path="Vector2.ts" />

module BulletStorm {
    export class HitEffect{
    	static maxCount: number = 20;
    	constructor(public position: Vector2, public count?: number = 0, private image?: HTMLImageElement){
    	}
    	update(): void{
    		this.count += 1;
    	}
    	paint(g: CanvasRenderingContext2D): void{
    		g.save();
    		g.translate(
    			this.position.x,
            	this.position.y - this.count * 2
    		);
    		g.rotate(this.count * 0.1);
    		g.translate(
    			-this.image.width / 2,
            	-this.image.height / 2
    		);
    		g.globalAlpha = 0.2 - 0.2 * this.count / HitEffect.maxCount;
            g.drawImage(this.image, 0, 0);
            g.restore();
        }
    }
}
