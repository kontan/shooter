/// <reference path="../../DefinitelyTyped/jquery/jquery.d.ts" />
/// <reference path="chainchomp.d.ts" />
/// <reference path="typescript-web.ts" />
/// <reference path="Vector2.ts" />
/// <reference path="Loader.ts" />

/// <reference path="HitEffect.ts" />
/// <reference path="Bullet.ts" />
/// <reference path="Unit.ts" />
/// <reference path="Action.ts" />

module BulletStorm {

    // image pathes

    //var origin: string = "http://phyzkit.net/shooter/res/";
    // export つけなくてもコンパイル通る　バグっぽい
    export var origin: string = "res/";
    var rumiaImagePath: string           = origin + 'rumia.png';
    var rumiaImagePathF: string          = origin + 'rumia_f.png';
    var rumiaImagePathB: string          = origin + 'rumia_b.png';
    var rumiaImagePathL: string          = origin + 'rumia_l.png';
    var rumiaImagePathR: string          = origin + 'rumia_r.png';
    var kogasaImagePath: string          = origin + 'kogasa.png';
    var bulletLargeImagePath: string     = origin + 'bullet_large.png';
    var dartImagePath: string            = origin + 'dart.png';
    var pointerImagePath: string         = origin + 'pointer.png';
    var heartImagePath: string           = origin + 'heart.svg';
    var starImagePath: string            = origin + 'star.svg';
    var stageBackgroundImagePath: string = origin + 'ground.png';
    var stageCloudImagePath: string      = origin + 'cloud.png';
    var upperCloudImagePath: string      = origin + 'cloud_upper.png';
    var hitEffectImagePath: string       = origin + 'hiteffect.png';

    var bulletLargeImage: HTMLImageElement = loadImage(bulletLargeImagePath);
    var dartImage: HTMLImageElement = loadImage(dartImagePath);
    var pointerImage = loadImage(pointerImagePath);
    var heartImage = loadImage(heartImagePath);
    var starImage = loadImage(starImagePath);
    var stageBackgroundImage = loadImage(stageBackgroundImagePath);
    var stageCloudImage = loadImage(stageCloudImagePath);
    var upperCloudImage = loadImage(upperCloudImagePath);
    var hitEffectImage = loadImage(hitEffectImagePath);

    export interface UnitImages{
        image: HTMLImageElement;
        front: HTMLImageElement;
        back:  HTMLImageElement;
        left:  HTMLImageElement;
        right: HTMLImageElement;    
    }

    var rumiaImage: UnitImages = {
        image: loadImage(rumiaImagePath),
        front: loadImage(rumiaImagePathF),
        back:  loadImage(rumiaImagePathB),
        left:  loadImage(rumiaImagePathL),
        right: loadImage(rumiaImagePathR)
    };

    var kogasaImage: UnitImages = {
        image: loadImage(kogasaImagePath),
        front: loadImage(kogasaImagePath),
        back:  loadImage(kogasaImagePath),
        left:  loadImage(kogasaImagePath),
        right: loadImage(kogasaImagePath)
    };

    //////////////////////////////////////////////////////////
    // Game library
    /////////////////////////////////////////////////////////

    export interface BulletScript {
        add(bullet: Bullet);
    }

    /////////////////////////////////////////////////////////
    // Application
    ///////////////////////////////////////////////////////////



    export class Shooter{
        private _width: number;
        private _height: number;
        stage: Stage = null;
        player: PlayerUnit = null;
        currentFrame: number = 0;
        reservedActions: { (): void; }[] = [];

        constructor(private canvas: HTMLCanvasElement){
            this._width = canvas.width;
            this._height = canvas.height;
            Object.seal(this);
        }

        get width(): number{
            return this._width;
        }

        get height(): number{
            return this._height;
        }        

        loadScript(path: string, onLoad: (scriptText:string)=>void): void{
        	var loader = new ResourceLoader(()=>{
        		onLoad(script());
        	});
        	var script = loader.loadText(path);
        	loader.start();
        }

        contains(point: Vector2, margin?: number = 0): bool{
            var x = point.x;
            var y = point.y;
            return x >= -margin && x < (this.width  + margin) && 
                   y >= -margin && y < (this.height + margin);        
        }

        update(): void{
            this.reservedActions.filter(action=>action());
            this.stage.update();    
            this.currentFrame += 1;
        }

        /// アクションコンビネータ //////////////////////////////////////////////////////////////

        /**
         * 指定したフレーム数だけ待機します。
         */ 
        get wait(){       return BulletStorm.wait;        }
        get sequential(){ return  BulletStorm.sequential; }
        get loop(){       return BulletStorm.loop;        }
        get concurrent(){ return BulletStorm.concurrent;  }

        // 組み込みアクション ////////////////////////////////////////////////////////////////////////////////////////////////////////

        // n-way 弾を発射します。
        // origin, target に渡されたオブジェクトは複製されずにそのまま参照され続けることに注意してください。
        // アクションが作成された瞬間の位置に対して固定して発射したい場合は、clone してから渡してください。
        nway(n: number, d: number, origin: Vector2, target: Vector2, speed: number){
            return ()=>{
                var velocity = new Vector2();
                velocity.subVectors(target, origin);
                velocity.setLength(1);

                var angle = Math.atan2(velocity.y, velocity.x);
                for(var i = 0; i < n; i++){
                    var bullet = new LargeBullet();
                    bullet.position = origin.clone();
                    bullet.velocity = Vector2.fromAngle(angle - d * (n - 1) * 0.5 + d * i, speed);
                    this.stage.bullets.push(bullet);
                }
            }
        }
    }
    Object.freeze(Shooter);

    export class Stage{
    	bullets: Bullet[] = [];
        playerBullets: Bullet[] = [];
        units: EnemyUnit[] = [];
        effects: HitEffect[] = [];
        enemy: EnemyUnit = null;

        stageScrollDelta: number = 0;
        cloudScrollDelta: number = 0;
        lowerCloudScrollDelta: number = 0;

        // visual states
        pointerAlpha: number = 0;
    	swinging: Vector2 = new Vector2(0, 0);
    	brightness: number = 1;
        totalFrameCount: number = 0;

        constructor(private shooter: Shooter){
            Object.seal(this);
        }

        swing(size?: number = 20, angle?: number = Math.PI * 2 * Math.random()): void{
            this.swinging = new Vector2(size * Math.cos(angle), size * Math.sin(angle));  
        }

        isActive(): bool{
        	return this.shooter.player.life > 0 && this.units.length > 0;
        }

        // スペルカードを起動します。
        spell(): void{

        }

        update(): void{
        	if(this.isActive()){

    	    	// update game states

    			this.bullets.forEach((bullet: Bullet)=>{
    	            bullet.update();
    	        });

    	        this.playerBullets.forEach((bullet: Bullet)=>{
    	            bullet.update();
    	        });

    	        this.units.forEach((unit: Unit)=>{
    	            unit.update();
    	        });

    	        this.shooter.player.update();

    			this.effects = this.effects.filter((effect: HitEffect)=>{
    	            effect.update();
    	            return effect.count < HitEffect.maxCount;
    	        });	                
    				
    				this.playerBullets = this.playerBullets.filter((bullet: Bullet)=>{
    	            return this.shooter.contains(bullet.position, 64);
    	        });

    	        this.bullets = this.bullets.filter((bullet: Bullet)=>{
    	            return this.shooter.contains(bullet.position, 64);
    	        });

    	        
    	        // collision detection

    	        if(this.shooter.player.probation === 0){
    	        	var crashed = false;
    	            this.bullets = this.bullets.filter((bullet: Bullet)=>{
    	                var delta = new Vector2(0, 0);
    	                delta.subVectors(this.shooter.player.position, bullet.position);
    	                if(delta.length() < (this.shooter.player.radius + bullet.size)){
    	                	crashed = true;    
    	                    return false;
    	                }else{
    	                    return true;
    	                }
    	            });
    	            if(crashed){
    					this.shooter.player.crash();
    	                this.shooter.stage.swing();	            	
    	            }
    	        }

    	        this.playerBullets = this.playerBullets.filter((bullet: Bullet)=>{
    	        	var result = true;
    	        	for(var i = 0; i < this.units.length; i++){
    	        		var unit: EnemyUnit = this.units[i];
    	                var delta = new Vector2(0, 0);
    	                delta.subVectors(unit.position, bullet.position);
    	                if(delta.length() < (unit.radius + bullet.size)){
    	                    result = false;
    	                    this.effects.push(new HitEffect(new Vector2(
    	                    	bullet.position.x - 8 + 16 * Math.random(),
    	                    	bullet.position.y - 8 * Math.random()
    	                    ), 0, hitEffectImage));
    	                    unit.life = Math.max(0, unit.life - 1);
    	                    break;
    	                }
    	        	}
    	        	return result;
    	        });


    	        // visual effects /////////////////////////////////////////////////////////////////

    	        this.totalFrameCount += 1;
    	        this.brightness = Math.min(1, this.brightness + 0.02);

    			// swinging dumper
    			this.swinging.mul(0.95);    

    	        // scroll 
    	        this.stageScrollDelta += 2.0;
    	        this.stageScrollDelta = this.stageScrollDelta % stageBackgroundImage.height;    

    	        this.cloudScrollDelta += 22.2;
    	        this.cloudScrollDelta = this.cloudScrollDelta % stageCloudImage.height;

    	        this.lowerCloudScrollDelta += 8.7;    
    	        this.lowerCloudScrollDelta = this.lowerCloudScrollDelta % stageCloudImage.height;
    	    }else{
    	    	this.brightness = Math.max(0, this.brightness - 0.02);
    	    }
        }


        paint(graphics: CanvasRenderingContext2D): void{

    	    graphics.save();
    	    var swingRange = Math.sin(Math.PI * 2 * (this.totalFrameCount % 5) / 5);
    	    graphics.translate(
    	        swingRange * this.swinging.x, 
    	        swingRange * this.swinging.y
    	    );

            // background
            graphics.drawImage(stageBackgroundImage, 0, this.stageScrollDelta);
            graphics.drawImage(stageBackgroundImage, 0, this.stageScrollDelta - stageBackgroundImage.height);

            graphics.drawImage(stageCloudImage, 0, this.lowerCloudScrollDelta);
            graphics.drawImage(stageCloudImage, 0, this.lowerCloudScrollDelta - stageCloudImage.height);

            graphics.globalCompositeOperation = 'lighter';
            graphics.drawImage(upperCloudImage, 0, this.cloudScrollDelta);
            graphics.drawImage(upperCloudImage, 0, this.cloudScrollDelta - stageCloudImage.height);
            graphics.globalCompositeOperation = 'source-over';

            // draw enemies
            this.units.forEach((unit: Unit)=>{
                graphics.save();
                graphics.translate(unit.position.x, unit.position.y);
                unit.paint(graphics);
                graphics.restore();
            });

            // draw player
    		graphics.save();
            graphics.translate(this.shooter.player.position.x, this.shooter.player.position.y);
            this.shooter.player.paint(graphics);
            graphics.restore();

            this.effects.forEach((effect: HitEffect)=>{
            	effect.paint(graphics);
            });
            
            // draw player bullets
            this.playerBullets.forEach((bullet: Bullet)=>{
                graphics.save();
                graphics.translate(bullet.position.x, bullet.position.y);
                bullet.paint(graphics);
                graphics.restore();
            });

            // draw bullets
            this.bullets.forEach((bullet: Bullet)=>{
                graphics.save();
                graphics.translate(bullet.position.x, bullet.position.y);
                bullet.paint(graphics);
                graphics.restore();
            });

            // draw pointer 
            if(this.pointerAlpha > 0){
                graphics.save();
                graphics.translate(this.shooter.player.position.x, this.shooter.player.position.y);
                graphics.globalAlpha = this.pointerAlpha;
                graphics.drawImage(pointerImage, -pointerImage.width / 2, -pointerImage.height / 2);
                graphics.restore();
            }

    	    graphics.restore();

    		// paint HUD
    		if(this.enemy !== null){
    			graphics.fillStyle = 'rgba(0, 0, 0, 0.5)';
    			graphics.fillRect(10, 10, 480, 3);
    			graphics.fillStyle = 'rgba(255, 64, 64, 0.9)';
    			graphics.fillRect(10, 10, 480 * this.enemy.life / this.enemy.maxLife, 3);
    		}

    	    if(this.brightness < 1){
    	    	graphics.fillStyle = 'rgba(0, 0, 0, ' + (0.5 * (1 - this.brightness)) + ')';
    	    	graphics.fillRect(0, 0, this.shooter.width, this.shooter.height);
    	    }

    	    // upper HUD
    	    if(this.brightness < 1){
    		    graphics.save();
    		    graphics.globalAlpha = 1 - this.brightness;
    		    graphics.fillStyle = 'white';
    		    graphics.font = 'normal 400 48px/2 Unknown Font, sans-seri';
    		    var hudText = this.shooter.player.life > 0 ? 'Stage Cleared!' : 'Game Over...';
    		    var metrics = graphics.measureText(hudText);
    		    graphics.fillText(hudText, (this.shooter.width - metrics.width) / 2, 200);
    		    graphics.restore();
    		}
        }
    }

    export class LargeBullet extends Bullet{
        constructor(){
            super(4);
            Object.seal(this);
        }
        paint(g: CanvasRenderingContext2D): void{
            g.globalCompositeOperation = 'lighter';
            g.drawImage(
                bulletLargeImage, 
                -bulletLargeImage.width / 2,
                -bulletLargeImage.height / 2
            );
        }
    }
    Object.freeze(LargeBullet);

    export class DartBullet extends Bullet{
        constructor(){
            super(4);
            Object.seal(this);
        }
        paint(g: CanvasRenderingContext2D): void{
            //g.globalCompositeOperation = 'lighter';
            g.drawImage(
                dartImage, 
                -dartImage.width / 2,
                -dartImage.height / 2
            );
        }
    }
    Object.freeze(DartBullet);

    export class EnemyUnit extends Unit{
        scriptText: string = null;
        private scriptState: any = {}; 
        maxLife: number = 1000;
        life: number = 1000;
        exposed: Object = undefined;
        scriptFunc: () => void = undefined;

        constructor(private shooter: Shooter){
            super(shooter, kogasaImage);
            this.radius = 30;
            this.exposed = {
                'shooter':  this.shooter,
                'unit': this,
                'state':  this.scriptState,
                'Vector2': Vector2,
                'LargeBullet': LargeBullet
            };
            Object.seal(this);
        }

        setScript(scriptText: string): void{

            // 動的に引数を構成して new する
            // http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible
            function construct(constructor, args) {
                function F() {
                    return constructor.apply(this, args);
                }
                F.prototype = constructor.prototype;
                return new F();
            }

            try{
                this.scriptText = scriptText;
                this.scriptState = {};
                var env = chainchomp.pick();
                this.scriptFunc = env(scriptText, this.exposed);
            }catch(e){
                console.log(e.message);
                console.log(scriptText);
                this.scriptFunc = null;
            }
        }

        update(): void{
            super.update();
            if(this.scriptFunc !== null){
                var args: any[] = [
                    this.shooter, 
                    this, 
                    this.scriptState,
                    Vector2,
                    LargeBullet
                ];
                try{
                    this.scriptFunc();
                }catch(e){
                    console.log('Script Runtime Error: ' + e.message);
                    this.scriptFunc = null;
                }
            }

            if(this.life === 0){
            	this.shooter.stage.units.splice(this.shooter.stage.units.indexOf(this), 1);
            	if(this.shooter.stage.enemy === this){
            		this.shooter.stage.enemy = null;
            	}
            }
        }
    }
    Object.freeze(EnemyUnit);

    export class PlayerUnit extends Unit{
        life: number = 6;
        bomb: number = 3;
        probation: number = 0;
        constructor(shooter: Shooter){
            super(shooter, rumiaImage);
            Object.seal(this);
        }
        crash(): void{
            this.probation = 120;
            this.life = Math.max(0, this.life - 1);
        }
        update(): void{
            super.update();
            this.probation = Math.max(0, this.probation - 1);
        }
        paint(g: CanvasRenderingContext2D): void{
            if(this.probation > 0 && Math.floor(this.probation / 2) % 2 === 0){
                g.globalAlpha = 0.5;
            }
            super.paint(g);
        }
    }
    Object.freeze(PlayerUnit);
}
