

//////////////////////////////////////////////////////////
// Game library
/////////////////////////////////////////////////////////

class Vector2 {
    constructor(public x?: number = 0, public y?: number = 0) {
    }
    static fromAngle(angle: number, length: number): Vector2{
    	return new Vector2(
	    	length * Math.cos(angle), 
	    	length * Math.sin(angle)
	    );
    }
    add(v: Vector2): void {
        this.x += v.x;
        this.y += v.y;
    } 
    addVectors(a: Vector2, b: Vector2): void {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
    }
    subVectors(a: Vector2, b: Vector2): void {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
    }
    mul(t: number): void{
        this.x *= t;
        this.y *= t;
    }
    length(): number {
        return Math.sqrt(this.lengthSq());
    }
    lengthSq(): number {
        return this.x * this.x + this.y * this.y;
    }
    setLength(v: number): void{
    	var t = v / this.length();
    	this.x *= t;
    	this.y *= t;
    }
    clone(): Vector2{
        return new Vector2(this.x, this.y);
    }
}

function createImage(path: string): HTMLImageElement{
    var img = new Image();
    img.src = path;
    return img;
}


class ResourceLoader{
    private resourceCount: number = 0;
    private loaders: { (): void; }[] = [];

    constructor(private onComplete: ()=>void){

    }

    private loading(): void{
        this.resourceCount += 1;
    }

    private loaded(){
        this.resourceCount -= 1;
        if(this.resourceCount === 0){
            this.onComplete();
        }
    }

    loadImage(path: string): () => HTMLImageElement{
        var img = new Image();
        img.addEventListener('load', this.loaded);
        img.addEventListener('error', this.loaded);
        img.addEventListener('abort', this.loaded);
        this.loaders.push(()=>{
            this.loading();
            img.src = path;
        });
        return ()=>img.complete ? img : null;
    }

    loadText(path: string): () => string{
        var request: XMLHttpRequest = new XMLHttpRequest();
        request.addEventListener('load', ()=>{
            this.loaded();
        });
        request.addEventListener('error', ()=>{
            this.loaded();
        });

        this.loaders.push(()=>{
            this.loading();
            request.open('get', path, false);
            request.send();
        });
        return ()=>request.readyState === 4 ? request.responseText : null;
    }

    loadTextFromElement(id: string): () => string{
        var element = document.getElementById(id);
        var text = element.innerText || element.textContent;
        return ()=>text;
    }

    start(): void{
    	if(this.loaders.length > 0){
	        this.loaders.forEach((loader)=>loader());
	        this.loaders = [];
        }else{
        	this.onComplete();
        }
    }
}

/////////////////////////////////////////////////////////
// Application
///////////////////////////////////////////////////////////


class Shooter{
    width: number;
    height: number;
    stage: Stage = null;
    player: PlayerUnit = null;
    totalFrameCount: number = 0;

    constructor(private canvas: HTMLCanvasElement){
        this.width = canvas.width;
        this.height = canvas.height;
    }

    loadScript(path: string, onLoad: (scriptText:string)=>void): void{
    	var loader = new ResourceLoader(()=>{
    		onLoad(script());
    	});
    	//var script = loader.loadText(path);
    	var script = loader.loadTextFromElement(path);
    	loader.start();
    }
}

class Stage{
    bullets: Bullet[] = [];
    playerBullets: Bullet[] = [];
    units: Unit[] = [];
    effects: HitEffect[] = [];
    constructor(public width: number, public height: number){
    }
}

class Bullet{
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


interface UnitImages{
    image: HTMLImageElement;
    front: HTMLImageElement;
    back:  HTMLImageElement;
    left:  HTMLImageElement;
    right: HTMLImageElement;	
}

var rumiaImage: UnitImages = {
    image: createImage('rumia.png'),
    front: createImage('rumia_f.png'),
    back:  createImage('rumia_b.png'),
    left:  createImage('rumia_l.png'),
    right: createImage('rumia_r.png')
};

var kogasaImage: UnitImages = {
    image: createImage('kogasa.png'),
    front: createImage('kogasa.png'),
    back:  createImage('kogasa.png'),
    left:  createImage('kogasa.png'),
    right: createImage('kogasa.png')
};

var bulletLargeImage: HTMLImageElement = createImage("bullet_large.png");
var dartImage: HTMLImageElement = createImage("dart.png");
var pointerImage = createImage('pointer.png');
var heartImage = createImage('heart.svg');
var starImage = createImage('star.svg');
var stageBackgroundImage = createImage('scroll.png');
var stageCloudImage = createImage('cloud.png');
var upperCloudImage = createImage('cloud_upper.png');
var hitEffectImage = createImage('hiteffect.png');

class LargeBullet extends Bullet{
    constructor(){
        super(4);
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

class DartBullet extends Bullet{
    constructor(){
        super(4);
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

class Unit{
    position: Vector2 = new Vector2(0, 0);
    radius: number = 5;
    velocity: Vector2 = new Vector2(0, 0);
    img: HTMLImageElement;
    constructor(private stage: Stage, private images: UnitImages){
    }

    update(): void{
        this.position.x = Math.max(0, Math.min(this.stage.width,  this.position.x + this.velocity.x));
        this.position.y = Math.max(0, Math.min(this.stage.height, this.position.y + this.velocity.y));

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

class EnemyUnit extends Unit{
    scriptText: string;
    private script: (shooter:Shooter) => void = null;
    private scriptState: any = {}; 
    maxLife: number = 1000;
    life: number = 1000;

    constructor(private shooter: Shooter){
        super(shooter.stage, kogasaImage);
        this.radius = 30;
    }

    setScript(scriptText: string): void{
        try{
            this.scriptText = scriptText;
            this.script = <(shooter: Shooter) => void> new Function('shooter', 'unit', 'state', scriptText);
        	this.scriptState = {};
        }catch(e){
            console.log(e);
        }
    }

    update(): void{
        super.update();
        if(this.script !== null){
            var args: any[] = [this.shooter, this, this.scriptState];
            try{
                this.script.apply(undefined, args);
            }catch(e){
                console.log(e);
            }
        }
    }
}

class PlayerUnit extends Unit{
    life: number = 6;
    bomb: number = 3;
    probation: number = 0;
    constructor(stage: Stage){
        super(stage, rumiaImage);
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

class HitEffect{
	static maxCount: number = 20;
	constructor(public position: Vector2, public count?: number = 0){
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
			-hitEffectImage.width / 2,
        	-hitEffectImage.height / 2
		);
		g.globalAlpha = 0.2 - 0.2 * this.count / HitEffect.maxCount;
        g.drawImage(hitEffectImage, 0, 0);
        g.restore();
    }
}

/////////////////////////////////////////////////////////
// Initialization
///////////////////////////////////////////////////////////

window.addEventListener('load', ()=>{

    var loader: ResourceLoader = new ResourceLoader(()=>{
        var canvas: HTMLCanvasElement = <HTMLCanvasElement> document.querySelector('#canvas');
        var graphics: CanvasRenderingContext2D = this.canvas.getContext('2d');
        
        // fps counter
        var fpsCountStart: number = performance.now();
        var frameCount: number = 0;
        var bulletsIndicator: HTMLSpanElement = <HTMLSpanElement> document.querySelector('#bullets');
        var fpsIndicator: HTMLSpanElement = <HTMLSpanElement> document.querySelector('#fps');

        // visual states
        var swinging: Vector2 = new Vector2(0, 0);
        var pointerAlpha: number = 0;
        var stageScrollDelta: number = 0;
        var cloudScrollDelta: number = 0;
        var lowerCloudScrollDelta: number = 0;    

        function swing(size?: number = 20, angle?: number = Math.PI * 2 * Math.random()): void{
            swinging = new Vector2(size * Math.cos(angle), size * Math.sin(angle));
        }        

        // game object initialization
        var stage: Stage = new Stage(canvas.width, canvas.height);
        var shooter: Shooter = new Shooter(canvas);
        shooter.stage = stage;

        var rumia: PlayerUnit = new PlayerUnit(stage);
        rumia.position.x = canvas.width / 2;
        rumia.position.y = canvas.height - 150;
        shooter.player = rumia;

        var enemy: EnemyUnit = new EnemyUnit(shooter);
        enemy.position.x = shooter.width / 2;
        enemy.position.y = shooter.height / 2 - 160;
        enemy.setScript(bulletScript());
        stage.units.push(enemy);

        

        // event handling

        var keyTable: { [keyCode: number]: number; } = <any>{};

        window.addEventListener('keydown', (e: KeyboardEvent)=>{
            if(keyTable[e.keyCode] === undefined){
                keyTable[e.keyCode] = shooter.totalFrameCount;
            }
            if( ! editing){
            	e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e: KeyboardEvent)=>{
            delete keyTable[e.keyCode];
            if( ! editing){
            	e.preventDefault();
            }
        });    

        function getKey(keyCode: number): number{
            return keyTable[keyCode] !== undefined ? (keyTable[keyCode] - shooter.totalFrameCount) : null;
        }

        function contains(point: Vector2, margin?: number = 0): bool{
            var x = point.x;
            var y = point.y;
            return x >= -margin && x < (canvas.width  + margin) && 
                   y >= -margin && y < (canvas.height + margin);        
        }

        // editor event handling

        var editing: bool = false;

        document.getElementById('edit').addEventListener('click', ()=>{
            document.getElementById('textarea').value = enemy.scriptText;
            document.getElementById('editor').setAttribute('style', 'display: block;');
            editing = true;
        });

        document.getElementById('edit_cancel').addEventListener('click', ()=>{
            document.getElementById('editor').removeAttribute('style');
            editing = false;
        });

        document.getElementById('edit_ok').addEventListener('click', ()=>{
            enemy.setScript(document.getElementById('textarea').value);
            document.getElementById('editor').removeAttribute('style');
            editing = false;
        });

        var samples = document.querySelectorAll('#samples > a');
        for(var i = 0; i < samples.length; i++){
        	()=>{
	        	var a = <HTMLAElement> samples[i];
	        	a.addEventListener('click', (e: MouseEvent)=>{
	        		shooter.loadScript(a.href, (script: string)=>{
	        			var textarea = <HTMLTextareaElement> document.getElementById('textarea');
	        			textarea.value = script;
	        		});        		
	        		e.preventDefault();
	        	});
	        }();
        }

        // game loop ///////////////////////////////////////////////////////////////

        function updateFrame(): void{
            var requestAnimationFrame = window['requestAnimationFrame'] || 
                                        window['mozRequestAnimationFrame'];

            requestAnimationFrame(()=>{
                
                if(editing === false){
                	// update //////////////////////////////////////////////////////////////////////////

	                // key 
	                if(getKey(32)){ // space key
	                    swing();
	                }

	                
	                var accurate = getKey(16) !== null;
	                var speed = accurate ? 1 : 3;
	                pointerAlpha = Math.max(0, Math.min(1, pointerAlpha + 0.1 * (accurate ? 1 : -1)));

	                shooter.player.velocity.x = 0;
	                shooter.player.velocity.y = 0;

	                if(getKey(37)){
	                    shooter.player.velocity.x -= speed;
	                }
	                if(getKey(38)){
	                    shooter.player.velocity.y -= speed;
	                }
	                if(getKey(39)){
	                    shooter.player.velocity.x += speed;
	                }
	                if(getKey(40)){
	                    shooter.player.velocity.y += speed;
	                }

	                if(getKey(90)){    // z
	                	for(var i = 0; i < 1; i++){
		                    var bullet = new DartBullet();
		                    bullet.position = shooter.player.position.clone();
		                    bullet.position.y += 30 * i;
		                    bullet.velocity = new Vector2(0, -30);
		                    stage.playerBullets.push(bullet);
		                }
	                }

	                // update

	                //scriptFunction.apply(undefined, [shooter]);

	                stage.bullets.forEach((bullet: Bullet)=>{
	                    bullet.update();
	                });

	                stage.playerBullets.forEach((bullet: Bullet)=>{
	                    bullet.update();
	                });

	                stage.units.forEach((unit: Unit)=>{
	                    unit.update();
	                });

	                shooter.player.update();

					stage.effects = stage.effects.filter((effect: HitEffect)=>{
	                    effect.update();
	                    return effect.count < HitEffect.maxCount;
	                });	                
 					
 					stage.playerBullets = stage.playerBullets.filter((bullet: Bullet)=>{
	                    return contains(bullet.position, 64);
	                });

	                stage.bullets = stage.bullets.filter((bullet: Bullet)=>{
	                    return contains(bullet.position, 64);
	                });

	                bulletsIndicator.innerText = stage.bullets.length.toString();
	                bulletsIndicator.textContent = bulletsIndicator.innerText;

	                // collision detection

	                if(shooter.player.probation === 0){
	                    stage.bullets = stage.bullets.filter((bullet: Bullet)=>{
	                        var delta = new Vector2(0, 0);
	                        delta.subVectors(shooter.player.position, bullet.position);
	                        if(delta.length() < (shooter.player.radius + bullet.size)){
	                            shooter.player.crash();
	                            swing();
	                            return false;
	                        }else{
	                            return true;
	                        }
	                    });
	                }

	                stage.playerBullets = stage.playerBullets.filter((bullet: Bullet)=>{
	                	var result = true;
	                	for(var i = 0; i < stage.units.length; i++){
	                		var unit: EnemyUnit = stage.units[i];
	                        var delta = new Vector2(0, 0);
	                        delta.subVectors(unit.position, bullet.position);
	                        if(delta.length() < (unit.radius + bullet.size)){
	                            result = false;
	                            stage.effects.push(new HitEffect(new Vector2(
	                            	bullet.position.x - 8 + 16 * Math.random(),
	                            	bullet.position.y - 8 * Math.random()
	                            )));
	                            unit.life = Math.max(0, unit.life - 1);
	                            break;
	                        }
	                	}
	                	return result;
                    });

	                // dumper

	                swinging.mul(0.95);

	                // heart
	                var lifeGauge = <HTMLSpanElement> document.querySelector('#life');
	                if(lifeGauge.childNodes.length !== shooter.player.life){
	                    // remove all child
	                    while(lifeGauge.childNodes.length > 0){
	                        lifeGauge.removeChild(lifeGauge.childNodes[0]);
	                    }
	                    // add images
	                    for(var i = 0; i < shooter.player.life; i++){
	                        lifeGauge.appendChild(createImage('heart.svg'));
	                    }
	                }

	                // bomb
	                var bombGauge = <HTMLSpanElement> document.querySelector('#bomb');
	                if(bombGauge.childNodes.length !== shooter.player.life){
	                    // remove all child
	                    while(bombGauge.childNodes.length > 0){
	                        bombGauge.removeChild(bombGauge.childNodes[0]);
	                    }
	                    // add images
	                    for(var i = 0; i < shooter.player.bomb; i++){
	                        bombGauge.appendChild(createImage('star.svg'));
	                    }
	                }

	                // scroll 
	                stageScrollDelta += 2.0;
	                stageScrollDelta = stageScrollDelta % stageBackgroundImage.height;    

	                cloudScrollDelta += 22.2;
	                cloudScrollDelta = cloudScrollDelta % stageCloudImage.height;

	                lowerCloudScrollDelta += 8.7;    
	                lowerCloudScrollDelta = lowerCloudScrollDelta % stageCloudImage.height;

	                // paint　///////////////////////////////////////////////////////////////////////////

	                graphics.save();
	                var swingRange = Math.sin(Math.PI * 2 * (shooter.totalFrameCount % 5) / 5);
	                graphics.translate(
	                    swingRange * swinging.x, 
	                    swingRange * swinging.y
	                );

	                // background
	                graphics.drawImage(stageBackgroundImage, 0, stageScrollDelta);
	                graphics.drawImage(stageBackgroundImage, 0, stageScrollDelta - stageBackgroundImage.height);

	                graphics.drawImage(stageCloudImage, 0, lowerCloudScrollDelta);
	                graphics.drawImage(stageCloudImage, 0, lowerCloudScrollDelta - stageCloudImage.height);

	                graphics.globalCompositeOperation = 'lighter';
	                graphics.drawImage(upperCloudImage, 0, cloudScrollDelta);
	                graphics.drawImage(upperCloudImage, 0, cloudScrollDelta - stageCloudImage.height);
	                graphics.globalCompositeOperation = 'source-over';

	                // draw enemies
	                stage.units.forEach((unit: Unit)=>{
	                    graphics.save();
	                    graphics.translate(unit.position.x, unit.position.y);
	                    unit.paint(graphics);
	                    graphics.restore();
	                });

	                // draw player
					graphics.save();
                    graphics.translate(shooter.player.position.x, shooter.player.position.y);
                    shooter.player.paint(graphics);
                    graphics.restore();

                    stage.effects.forEach((effect: HitEffect)=>{
                    	effect.paint(graphics);
                    });
	                
	                // draw player bullets
	                stage.playerBullets.forEach((bullet: Bullet)=>{
	                    graphics.save();
	                    graphics.translate(bullet.position.x, bullet.position.y);
	                    bullet.paint(graphics);
	                    graphics.restore();
	                });

	                // draw bullets
	                stage.bullets.forEach((bullet: Bullet)=>{
	                    graphics.save();
	                    graphics.translate(bullet.position.x, bullet.position.y);
	                    bullet.paint(graphics);
	                    graphics.restore();
	                });

	                // draw pointer 
	                if(pointerAlpha > 0){
	                    graphics.save();
	                    graphics.translate(shooter.player.position.x, shooter.player.position.y);
	                    graphics.globalAlpha = pointerAlpha;
	                    graphics.drawImage(pointerImage, -pointerImage.width / 2, -pointerImage.height / 2);
	                    graphics.restore();
	                }


	                graphics.restore();

	                // HUD //////////////////////////////////////////////////////////////

	                graphics.fillStyle = 'rgba(0, 0, 0, 0.5)';
	            	graphics.fillRect(10, 10, 480, 10);
					graphics.fillStyle = 'rgba(255, 255, 255, 0.9)';
	            	graphics.fillRect(10, 10, 480 * enemy.life / enemy.maxLife, 10);

	                // fps count /////////////////////////////////////////////////////////////
	                frameCount += 1;
	                var now = performance.now();
	                var delta = now - fpsCountStart;
	                if(delta >= 1000){
	                    fpsIndicator.innerText = (frameCount * 1000 / delta).toFixed(2);
	                    fpsIndicator.textContent = fpsIndicator.innerText;
	                    frameCount = 0;
	                    fpsCountStart = now;
	                }
	            }

                // request next frame ////////////////////////////////////////////////////////////
                shooter.totalFrameCount += 1;
                updateFrame();    
            });
        }

        updateFrame();
    });
    //var bulletScript: () => string = loader.loadText('bullets/nway.js');
    var bulletScript: () => string = loader.loadTextFromElement('script_nway');
    loader.start();
});